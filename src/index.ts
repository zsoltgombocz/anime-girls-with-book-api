import express, { Response, Request } from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { testConnection } from './db';
import { runScraper } from './scraper';
import { ImageWithId, Images } from './images/image.model';
import { Categories } from './categories/category.model';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.get("/", (_req, res) => {
    return res.json("Open source scraped anime girls with programming books deployed via github actions. I hope you like my work. 👋");
});

app.get("/images", async (
    req: Request<{}, {}, {}, { category: string, page: string, limit: string }>, 
    res: Response<ImageWithId[]>
) => {
    const category = req.query.category ? 
        decodeURIComponent(req.query.category) : null;
    
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');

    const result = await Images.aggregate<ImageWithId>([
        { $match: category ? {category} : {} },
        { $skip: page },
        { $limit: limit },
        { $sample: { size: limit * 2} }
    ]);
    const images = await result.toArray();

    return res.json(images);
});

app.get("/categories", async (_req, res) => {
    const result = await Categories.find({});
    const categories = await result.toArray();
    return res.json(categories);
});

app.listen(PORT, async () => {
    console.log(`Server started on internal port ${PORT}.`);
    
    const connection = await testConnection();

    if(!connection) {
        process.kill(0);
    }

    if(process.env.SCRAPE_ON_STARTUP) {
        console.log('Running scraper on startup.')
        runScraper();
    }

    //Scrape every day
    cron.schedule('0 0 * * *', () => {
        runScraper();
    });
});
