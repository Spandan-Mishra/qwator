import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authUserMiddleware } from "../middleware";
import { supabase } from "..";
import { createTaskSchema, signinSchema } from "@repo/types/zod-types";
import { Task } from "@repo/types";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

const router: Router = Router();
const LAMPORTS_PER_SOL = 1_000_000_000;

router.get('/task', authUserMiddleware, async (req, res) => {
    const taskId = Number(req.query.taskId);
    const userId = Number(req.userId);

    const taskDetails = await prismaClient.task.findFirst({
        where: {
            id: taskId,
            user_id: userId
        },
        include: {
            options: true
        }
    })

    if (!taskDetails) {
        res.status(403).json({
            message: "You cannot access this task"
        })
        return ;
    }

    const submissions = await prismaClient.submission.findMany({
        where: {
            task_id: taskId
        },
        include: {
            option: true
        }
    })

    const result: Record<string, {
        votes: number,
        image_url: string
    }> = {}

    taskDetails.options.forEach(option => {
        result[option.id] = {
            votes: 0,
            image_url: option.image_url
        }
    })

    submissions.forEach(s => {
        result[s.option_id]!.votes++
    })

    res.json({
        result,
        taskDetails
    })
})

router.post('/task', authUserMiddleware, async (req, res) => {
    const data = req.body;
    const userId = Number(req.userId);

    const parsedData = createTaskSchema.safeParse(data);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect data format"
        })
        return ;
    }

    const response = await prismaClient.$transaction(async tx => {
        const task = await tx.task.create({
            data: {
                title: parsedData.data?.title,
                signature: parsedData.data?.signature,
                amount: (parsedData.data?.amount ?? 0) * LAMPORTS_PER_SOL,
                user_id: userId
            }
        })

        await tx.option.createMany({
            data: parsedData.data.options.map(x => ({
                image_url: x.image_url,
                task_id: task.id
            }))
        })

        return task
    })

    res.json({
        id: response.id,
        message: "Task created successfully"
    })
})

router.get('/presignedUrl', authUserMiddleware, async (req, res) => {
    const userId = Number(req.userId);

    const { data, error } = await supabase
    .storage
    .from('user-bucket')
    .createSignedUploadUrl(`${userId}/image_${(Math.floor(Math.random() * 10**9))}.jpg`);
    
    res.status(200).json({
        data
    })
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

    const message = new TextEncoder().encode(`Sign in to qwator with wallet ${parsedData.data.address} as a user`);
    
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

    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: parsedData.data.address
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            id: existingUser.id
        }, process.env.USER_SECRET || "secret");

        res.json({
            token
        })
    } else {
        const user = await prismaClient.user.create({
            data: {
                address: parsedData.data.address,
            }
        })

        const token = jwt.sign({
            id: user.id
        }, process.env.USER_SECRET || "secret")

        res.status(200).json({
            token
        })
    }
})

export default router