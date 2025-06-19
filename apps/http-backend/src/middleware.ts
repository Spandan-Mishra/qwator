import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        if(decoded) {
            if (typeof decoded === "string") {
                res.status(403).json({
                    message: "You are not logged in"
                })
                return;
            }
            req.userId = (decoded as JwtPayload).id;
            next()
        } else {
            res.status(403).json({
                message: "Unauthorized access"
            })
        }
    } else {
        res.status(400).json({
            message: "You are not logged in"
        })
    }
}