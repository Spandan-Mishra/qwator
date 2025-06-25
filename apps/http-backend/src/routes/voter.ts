import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authVoterMiddleware } from "../middleware";
import { createSubmissionSchema } from "@repo/types/zod-types";
import { getNextTask } from "../services/task";

const router: Router = Router();

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

    const txnSignature = "0x123123213" // TODO: get from the blockchain

    const response = await prismaClient.$transaction(async tx => {
        await tx.voter.update({
            where: {
                id: voterId
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

        const payout =await tx.payout.create({
            data: {
                voter_id: voterId,
                amount: voter.pending_amount,
                signature: txnSignature,
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
        balance: voter.pending_amount + voter.locked_amount
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

    const amount = Math.floor(task.amount / Number(process.env.VOTERS_PER_TASK || 1000));

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
    const address = "x9L3XaDQcurLgDhZHYPURiYagdK3RmHSycvtrsHXDV9";

    const existingVoter = await prismaClient.voter.findFirst({
        where: {
            address
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
                address,
                pending_amount: 0,
                locked_amount: 0
            }
        })
    
        const token = jwt.sign({
            id: voter.id
        }, process.env.VOTER_SECRET || "secret");

        res.json({
            token
        })
    }
})

export default router