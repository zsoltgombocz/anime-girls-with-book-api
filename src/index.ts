import express from 'express';
import dotenv from 'dotenv';
import { DataProvider } from './DataProvider';
import { dataProviderMiddleware } from './middlewares/DataProviderMiddleware';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(dataProviderMiddleware);

app.get("/", (req, res) => {
    const provider: DataProvider = res.locals.provider;
    const categories: string[] = provider.getCategories();

    return res.json(categories);
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
