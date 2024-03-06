import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { testConnection } from './db';
import { runScraper } from './scraper';
import ImageRoute from './images/image.route'; 
import CategoryRoute from './categories/category.route'; 
import errorHandler from './middlewares/errorHandler';

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.get("/", (_req, res) => {
    return res.json("Open source scraped anime girls with programming books deployed via github actions. I hope you like my work. 👋");
});

app.use('/images', ImageRoute);
app.use('/categories', CategoryRoute);

app.use(errorHandler);

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
