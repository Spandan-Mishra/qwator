import { z } from "zod"

export const signinSchema = z.object({
    address: z.string(),
    signature: z.object({
        type: z.literal('Buffer'),
        data: z.array(z.number().int().min(0).max(255)).length(64)
    })
})

export const createTaskSchema = z.object({
    title: z.string(),
    options: z.array(
        z.object({
            image_url: z.string()
        })
    ).min(2).max(5),
    signature: z.string(),
})

export const createSubmissionSchema = z.object({
    task_id: z.number(),
    option_id: z.number()
})
