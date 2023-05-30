import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const jwtSecret = String(process.env.JWT);

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(400).json({ msg: "Authentication Failed!" });
        const user = jwt.verify(token, jwtSecret);
        res.status(200).json({ status: 200, user });
    } catch (error) {
        res.status(400).json({ msg: "Access denied", error });
    }
};