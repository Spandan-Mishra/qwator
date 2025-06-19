import { Router } from "express";
import { prismaClient } from "@repo/database"
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware";
import { supabase } from "..";

const router: Router = Router();

router.get('/presignedUrl', authMiddleware, async (req, res) => {
    const userId = req.userId;

    const { data, error } = await supabase
    .storage
    .from('user-bucket')
    .createSignedUploadUrl(`${userId}/${Math.random()}/image.jng`);
    
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