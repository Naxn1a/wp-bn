require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

import generateShortUrl from "../../libs/generateShortUrl";
import { isWebUri } from "valid-url";
import jwt from "jsonwebtoken";
const jwtSecret = String(process.env.JWT);

const prisma = new PrismaClient();

export const createUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.token;
        const { url } = req.body;
        if (!token) return console.log("token undefined");
        const id = jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
            return decoded.id;
        });
        const host = req.headers.origin;
        const { shortCode, shortUrl } = generateShortUrl(String(host));
        if (!isWebUri(url)) return res.status(400).json({ status: 400, msg: "Invalid Url" });
        const result = await prisma.$transaction(async (tx: any) => {
            const originalUrl = await tx.url.findFirst({
                where: {
                    originalUrl: url,
                },
            });

            if (originalUrl) return originalUrl;

            const newUrl = await tx.url.create({
                data: {
                    originalUrl: url,
                    shortUrl,
                    urlCode: shortCode,
                    users: {
                        connect: {
                            id: String(id),
                        },
                    },
                },
            });

            await tx.urlAnalytic.create({
                data: {
                    clicked: 0,
                    url: {
                        connect: {
                            id: newUrl.id,
                        },
                    },
                },
            });
            return newUrl;
        });

        return res.status(200).json({
            status: 200,
            url: {
                originalUrl: result.originalUrl,
                shortUrl: result.shortUrl,
                code: result.urlCode,
            },
        });
    } catch (err) {
        console.log(err);
    } finally {
        prisma.$disconnect();
        next();
    }
};

export const accessUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code } = req.body;
        const result = await prisma.$transaction(async (tx: any) => {
            const url = await tx.url.findUnique({
                where: {
                    urlCode: code,
                },
            });

            if (!url) return null;

            await tx.urlAnalytic.update({
                where: {
                    urlId: url.id,
                },
                data: {
                    clicked: {
                        increment: 1,
                    },
                },
            });
            return url;
        });

        if (!result)
            return res
                .status(400)
                .json({ status: 400, msg: "Invalid shorturl code!" });

        return res.status(200).json({ status: 200, url: result.originalUrl, urlId: result.id });
    } catch (err) {
        console.log(err);
    }
};

export const getUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.token;
        if (!token) return console.log("token undefined");

        const id = jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
            return decoded.id;
        });

        const data = await prisma.urlAnalytic.findMany({
            where: {
                url: {
                    usersId: String(id),
                },
            },
            include: {
                url: true,
            },
        });
        return res.status(200).json({ status: 200, url: data });
    } catch (err) {
        console.log(err);
    }
};

export const deleteUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idUrl, idAnalytic } = req.body;
        if (!idUrl || !idAnalytic) return console.log("id undefined");

        const reuslt = await prisma.$transaction(async (tx: any) => {
            await tx.urlAnalytic.delete({
                where: {
                    id: idAnalytic,
                },
            });

            const deleteUrl = await tx.url.delete({
                where: {
                    id: idUrl,
                },
            });

            return deleteUrl
        })

        res.status(200).json({ msg: "Delete success", reuslt });
    } catch (err) {
        console.log(err);
    }
};
