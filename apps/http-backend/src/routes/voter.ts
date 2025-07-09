import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authVoterMiddleware } from "../middleware";
import { createSubmissionSchema, signinSchema } from "@repo/types/zod-types";
import { getNextTask } from "../services/task";
import nacl from "tweetnacl";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import decode from "bs58"

const router: Router = Router();
const connection = new Connection("http://api.devnet.solana.com")

router.get('/payout', authVoterMiddleware, async (req, res) => {
    const voterId = Number(req.voterId);

    const voter = await prismaClient.voter.findFirst({
        where: {
            id: voterId
        }
    })

    if (!voter) {
        res.status(400).json({
            message: "Invalid voter"
        })
        return;
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(process.env.WALLET_ADDRESS!),
            toPubkey: new PublicKey(voter.address),
            lamports: voter.pending_amount
        })
    )

    const privateKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY!));
    const keypair = Keypair.fromSecretKey(privateKey);
    
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair],
        )

        const response = await prismaClient.$transaction(async tx => {
            const voterData = await tx.voter.updateMany({
                where: {
                    id: voterId,
                    pending_amount: {
                        gte: voter.pending_amount
                    }
                },
                data: {
                    pending_amount: {
                        decrement: voter.pending_amount
                    },
                    locked_amount: {
                        increment: voter.pending_amount
                    }
                }
            })

            if (voterData.count === 0) {
                throw new Error("Insufficient pending amount or already processing payment")
            }

            const payout =await tx.payout.create({
                data: {
                    voter_id: voterId,
                    amount: voter.pending_amount,
                    signature: signature,
                    status: "Processing"
                }
            })
            
            return payout;
        })

        // TODO: send the transaction to the blockchain
        res.json({
            message: "Payout is processing",
            id: response.id,
            amount: response.amount
        })
    } catch(e) {
        res.status(403).json({
            message: "Transaction failed"
        })
    }
})

router.get('/balance', authVoterMiddleware, async (req, res) => {
    const voterId = Number(req.voterId);

    const voter = await prismaClient.voter.findFirst({
        where: {
            id: voterId
        }
    })

    if (!voter) {
        res.status(400).json({
            message: "Invalid voter"
        })
        return;
    }

    res.json({
        balance: voter.pending_amount
    })
})

router.post('/submission', authVoterMiddleware, async (req, res) => {
    const voterId = Number(req.voterId);
    const data = req.body;

    const parsedData = createSubmissionSchema.safeParse(data);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid data"
        })
        return;
    }
    
    const task = await getNextTask(voterId);
    
    if(!task || task.id !== parsedData.data.task_id) {
        res.status(400).json({
            message: "Invalid task"
        })
        return;
    }

    const amount = Math.floor(task.amount / 1000);

    const response = await prismaClient.$transaction(async tx => {
        const submission = await tx.submission.create({
            data: {
                voter_id: voterId,
                task_id: parsedData.data.task_id,
                option_id: parsedData.data.option_id,
                amount
            }
        })

        await tx.voter.update({
            where: {
                id: voterId
            },
            data: {
                pending_amount: {
                    increment: amount
                }
            }
        })

        return submission;
    })

    const nextTask = await getNextTask(voterId);

    res.json({
        id: response.id,
        amount,
        task: nextTask ?? "No next task found"
    })
})

router.get('/nextTask', authVoterMiddleware, async (req, res) => {
    const voterId = Number(req.voterId);

    const task = await getNextTask(voterId);

    if (task) {
        res.json({
            task
        })
    } else {
        res.json({
            message: "No task found"
        })
    }
})

router.post('/signin', async (req, res) => {
    const data = req.body;
    
    const parsedData = signinSchema.safeParse(data);
    
    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect data format"
        })
        return ;
    }

    const message = new TextEncoder().encode(`Sign in to qwator with wallet ${parsedData.data.address} as voter`);
    
    const verificationResult = nacl.sign.detached.verify(
        message,
        new Uint8Array(parsedData.data.signature.data),
        new PublicKey(parsedData.data.address).toBytes()
    )

    if(!verificationResult) {
        res.status(403).json({
            message: "Invalid signature"
        })
        return ;
    }

    const existingVoter = await prismaClient.voter.findFirst({
        where: {
            address: parsedData.data.address
        }
    })

    if (existingVoter) {
        const token = jwt.sign({
            id: existingVoter.id
        }, process.env.VOTER_SECRET || "secret");
        
        res.json({
            token
        })
    } else {
        const voter = await prismaClient.voter.create({
            data: {
                address: parsedData.data.address,
                pending_amount: 0,
                locked_amount: 0
            }
        })
    
        const token = jwt.sign({
            id: voter.id
        }, process.env.VOTER_SECRET || "secret");

        res.status(200).json({
            token
        })
    }
})

export default router