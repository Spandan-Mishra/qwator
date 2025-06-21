import { z } from "zod"

export const createTaskSchema = z.object({
    title: z.string(),
    options: z.array(
        z.object({
            image_url: z.string()
        })
    ),
    signature: z.string(),
    amount: z.number()
})

export const createSubmissionSchema = z.object({
    task_id: z.number(),
    option_id: z.number()
})