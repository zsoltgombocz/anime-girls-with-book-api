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
    res: Response<{data: ImageWithId[], paginator: unknown}>,
    next: NextFunction
) => {
    try {
        const params = requestParams.parse(req.query);

        const aggregationPipeline: object[] = [
            { $match: params.category ? { category: params.category } : {} },
            { $skip: params.page ? params.page * params.limit : 0 },
            { $limit: params.limit }
        ];

        let paginator;

        if(params.page) {
            const allImages: number = await Images.countDocuments();

            aggregationPipeline.push({ $sample: { size: params.limit * 2 } });
            const totalPages = Math.floor(allImages / params.limit);
            const currentpage = params.page;
            paginator = {
                hasNextPage: totalPages > params.page,
                nextPage: totalPages < currentpage + 1 ? null : currentpage + 1,
                previousPage: currentpage !== 1 ? currentpage - 1 : null,
                totalPages: Math.floor(allImages / params.limit),
                currentPage: currentpage
            };
        }
        const result = await Images.aggregate<ImageWithId>(aggregationPipeline);
        const images = await result.toArray();

        return res.json({
            data: images,
            paginator 
        });
    } catch (error) {
        next(error);
    }
});

export default router;