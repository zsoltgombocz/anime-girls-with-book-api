import { Request, Response, Router } from 'express';
import { Categories, Category } from './category.model';

const router = Router();

router.get("/", async (
    _req: Request, 
    res: Response<Category[]>,
) => {
    const result = await Categories.find({});
    const categories = await result.toArray();
    return res.json(categories);
});

export default router;