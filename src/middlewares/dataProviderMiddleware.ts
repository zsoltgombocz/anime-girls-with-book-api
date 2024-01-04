import { NextFunction, Request, Response } from "express";
import { DataProvider } from "../DataProvider";

export const dataProviderMiddleware = async (_req: Request, res: Response, next: NextFunction) => {
    const provider = await new DataProvider('data.json').load();
    res.locals.provider = provider;

    next();
}