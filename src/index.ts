import express from 'express';
import dotenv from 'dotenv';
import { DataProvider } from './data/DataProvider';
import { dataProviderMiddleware } from './middlewares/dataProviderMiddleware';
import { BookCategory, PaginatedImages } from './types';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(dataProviderMiddleware);

app.get("/", (_req, res) => {
    return res.json("Open source scraped anime girls with programming books. I hope you like my work. 👋");
});

app.get("/images", (req, res) => {
    const provider: DataProvider = res.locals.provider;
    const page = parseInt(req.query.page as string) || null;
    const category = req.query.category || null;

    const images: PaginatedImages = provider.getPaginatedImages(page, 10, category as string);

    return res.json({ images });
});

app.get("/categories", (_req, res) => {
    const provider: DataProvider = res.locals.provider;
    const categories: BookCategory[] = provider.getCategories();

    return res.json(categories);
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});
