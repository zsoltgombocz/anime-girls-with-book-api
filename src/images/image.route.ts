import { NextFunction, Request, Response, Router } from 'express';
import { ImageWithId, Images } from './image.model';
import * as z from 'zod';

const router = Router();

const requestParams = z.object({
    category: z.string().nullable().default(null),
    page: z.coerce.number().nullable().default(null),
    limit: z.coerce.number().default(10)
});

router.get("/", async (
    req: Request<{}, {}, {}, { category: string | undefined, page: string | undefined, limit: string | undefined}>, 
    res: Response<ImageWithId[]>,
    next: NextFunction
) => {
    try {
        const params = requestParams.parse(req.query);

        const aggregationPipeline: object[] = [
            { $match: params.category ? { category: params.category } : {} },
            { $skip: params.page ? params.page * params.limit : 0 },
            { $limit: params.limit }
        ];

        if(params.page) {
            aggregationPipeline.push({ $sample: { size: params.limit * 2 } });
        }

        const result = await Images.aggregate<ImageWithId>(aggregationPipeline);
        const images = await result.toArray();

        return res.json(images);
    } catch (error) {
        next(error);
    }
});

export default router;