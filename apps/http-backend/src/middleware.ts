import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (token) {
        const decoded = jwt.verify(token, process.env.USER_SECRET || "secret");

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
        res.status(411).json({
            message: "You are not logged in"
        })
    }
}

export const authVoterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (token) {
        const decoded = jwt.verify(token, process.env.VOTER_SECRET || "secret");

        if (decoded) {
            if (typeof decoded === "string") {
                res.status(403).json({
                    message: "You are not logged in"
                })
                return;
            }
            req.voterId = (decoded as JwtPayload).id;
            next()
        } else {
            res.status(403).json({  
                message: "Unauthorized access"
            })
        }
    } else {
        res.status(411).json({
            message: "You are not logged in"
        })
    }
}