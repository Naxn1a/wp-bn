require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const bcryptSalt = bcrypt.genSaltSync(10);

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.users.findUnique({
            where: {
                username: String(username),
            },
        });
        if (user)
            return res
                .status(400)
                .json({ status: 400, msg: "Username already exist!" });
        const pwd = bcrypt.hashSync(password, bcryptSalt);
        await prisma.users.create({
            data: {
                username: username,
                password: pwd,
            },
        });
        return res.status(200).json({ status: 200, msg: "Register success." });
    } catch (err) {
        console.log(err);
    } finally {
        prisma.$disconnect();
        next();
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.users.findUnique({
            where: {
                username: username,
            },
        });
        if (!user)
            return res
                .status(400)
                .json({ status: 400, msg: "Username not found!" });
        const login = bcrypt.compareSync(password, user.password);
        if (login) {
            const token = jwt.sign(
                { id: user.id, username: user.username },
                String(process.env.JWT)
            );
            return res
                .cookie("token", token, {
                    // httpOnly: false,
                    secure: true,
                    sameSite: "none",
                })
                .status(200)
                .json({
                    status: 200,
                    msg: "Login success.",
                    token,
                });
        }
        return res
            .status(400)
            .json({ status: 400, msg: "Username or password incorrect!" });
    } catch (err) {
        console.log(err);
    } finally {
        prisma.$disconnect();
        next();
    }
};
