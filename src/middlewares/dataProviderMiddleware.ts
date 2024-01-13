import { NextFunction, Request, Response } from "express";
import { DataProvider } from "../data/DataProvider";

export const dataProviderMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const provider = await new DataProvider('data.json', req.ip || 'default').load();
    res.locals.provider = provider;

    next();
}