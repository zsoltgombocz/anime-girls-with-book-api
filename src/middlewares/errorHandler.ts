import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

interface ErrorResponse {
    message: string;
    stack?: string;
}

export default function errorHandler(err: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);

    if(err instanceof ZodError) {
        return res.status(403).json(err);
    }else{
        return res.json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        });
    }
}