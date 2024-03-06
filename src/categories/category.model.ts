import * as z from 'zod';

import { db } from '../db';

export const Category = z.object({
    name: z.string(),
    url: z.string().url(),
    imageCount: z.number().default(0)
});

export type Category = z.infer<typeof Category>;
export const Categories = db.collection<Category>('categories');
