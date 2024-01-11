import express from 'express';
import dotenv from 'dotenv';
import { DataProvider } from './DataProvider';
import { dataProviderMiddleware } from './middlewares/dataProviderMiddleware';
import { BookCategory, Image } from './types';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(dataProviderMiddleware);

app.get("/", (req, res) => {
    return res.json("Open source scraped anime girls with programming books. I hope you like my work. 👋");
});

app.get("/images", (req, res) => {
    const provider: DataProvider = res.locals.provider;
    const images: Image[] = provider.getAllImages();

    return res.json({
        count: images.length,
        images
    });
});

app.get("/images/:category", (req, res) => {
    const provider: DataProvider = res.locals.provider;
    const images: Image[] = provider.getImagesFromCategory(req.params.category);

    return res.json({
        count: images.length,
        images
    });
});

app.get("/categories", (req, res) => {
    const provider: DataProvider = res.locals.provider;
    const categories: BookCategory[] = provider.getCategories();

    return res.json(categories);
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
