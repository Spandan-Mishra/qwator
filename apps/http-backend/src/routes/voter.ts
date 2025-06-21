import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authVoterMiddleware } from "../middleware";
import { createSubmissionSchema } from "@repo/zod/types";
import { getNextTask } from "../services/task";

const router: Router = Router();

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
    
    const submission = await prismaClient.submission.create({
        data: {
            voter_id: voterId,
            task_id: parsedData.data.task_id,
            option_id: parsedData.data.option_id
        }
    })

    const task = await getNextTask(voterId);

    res.json({
        id: submission.id,
        task: task ?? "No next task found"
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