import * as z from 'zod';
import { db } from '../db';
import { WithId } from 'mongodb';

export const Image = z.object({
    url: z.string().url(),
    height: z.number(),
    width: z.number(),
    category: z.string(),
    new: z.boolean().optional()
});

export default Image;
export type Image = z.infer<typeof Image>;
export type ImageWithId = WithId<Image>;
export const Images = db.collection<Image>('images');