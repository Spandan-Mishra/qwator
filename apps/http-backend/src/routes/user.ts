import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";
import { supabase } from "..";
import { createTaskSchema } from "@repo/zod/types";

const router: Router = Router();

router.get('/task', authMiddleware, async (req, res) => {
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
        result
    })
})

router.post('/task', authMiddleware, async (req, res) => {
    const data = req.body;
    const userId = req.userId;

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
                amount: parsedData.data?.amount,
                user_id: Number(userId)
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

router.get('/presignedUrl', authMiddleware, async (req, res) => {
    const userId = req.userId;

    const { data, error } = await supabase
    .storage
    .from('user-bucket')
    .createSignedUploadUrl(`${userId}/image_${(Math.floor(Math.random() * 10**9))}.jpg`);
    
    console.log(data);
    res.json({
        data
    })
})

router.post('/signin', async (req, res) => {
    const address = "EzAwYUaFHrk5oUhjPjAHj42iN4WuRt4Rf4XiQViQ4vGP";

    const existingUser = await prismaClient.user.findFirst({
        where: {
            address
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            id: existingUser.id
        }, process.env.JWT_SECRET || "secret");

        res.json({
            token
        })
    } else {
        const user = await prismaClient.user.create({
            data: {
                address
            }
        })

        const token = jwt.sign({
            id: user.id
        }, process.env.JWT_SECRET || "secret")

        res.json({
            token
        })
    }
})

export default router