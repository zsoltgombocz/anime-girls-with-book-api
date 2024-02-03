import * as cheerio from 'cheerio';
import { Categories, Category } from './categories/category.model';
import Image, { ImageWithId, Images } from './images/image.model';
import probe from 'probe-image-size';


const FOLDERS_SOURCE_URL = "https://github.com/cat-milk/Anime-Girls-Holding-Programming-Books";
const BASE_URL = "https://raw.githubusercontent.com/cat-milk/Anime-Girls-Holding-Programming-Books/master/";

type gitHubItem = {
    name: string,
    path: string
    contentType: 'directory' | 'file'
};

const scrapeCategories = async ():Promise<void> => {
    try {
        const response = await fetch(FOLDERS_SOURCE_URL);
        const body = await response.text();
        const $ = cheerio.load(body);
        
        const data = $('script[data-target="react-partial.embeddedData"]');

        //? Get the data which contains all the information and create a valid JSON from it.
        //? Access the 'items' field which holds the data of the folders and files.
        const validData = JSON.parse(`[${data.text().replace(/}(?={)/g, '},')}]`);
        const folders: gitHubItem[] = validData[1].props.initialPayload.tree.items;
        
        //? Filter for directories and generate a new array to match the schema and populate the database.
        const categories: Category[] = folders
        .filter(folder => folder.contentType === 'directory')
        .map<Category>(folder => ({
            name: folder.name,
            url: FOLDERS_SOURCE_URL + '/tree/master/' + encodeURIComponent(folder.path),
        }));

        //? Drop categories before inserting the newly scraped ones
        await Categories.drop();

        await Categories.insertMany(categories);
    } catch (error) {
        console.error('Error creating categories: ' + error);
    }
}

/*const getImagesFromURL = async (url : string): Promise<Image> => {

}*/

const scrapeImages = async (): Promise<void> => {
    const categories = await Categories.find().toArray();
   
    for(let category of categories) {
        const response = await fetch(category.url);
        try {
            const body = await response.json();
            const items: gitHubItem[] = body.payload.tree.items;
            
            //Transform raw data into a models
            let images = items
            .filter(item => item.contentType === 'file')
            .map<Image>(item => ({
                category: category.name,
                url: BASE_URL + item.path.split('/').map(fragment => encodeURIComponent(fragment)).join('/'),
                height: 0,
                width: 0,
                new: true,
            }));

            //Update or insert the images, if the image is not new set the field to false otherwise create the record
            for(let image of images) {
                const exists = await Images.findOne({url: image.url});

                let { width, height } = await probe(image.url);
                image.height = height;
                image.width = width;

                if(exists) {
                    await Images.updateOne({ _id: exists._id }, { $set: { ...image, new: false }});
                }else{
                    await Images.insertOne(image);
                }
            }

            //Halt the function in order to avoid GitHub to limit the requests
            console.log(`Saved images from ${category.name}.`)
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
            console.error('Failed to scrape:' + category.url, error);
        }
        
    }
}

export const runScraper = async (): Promise<void> => {
    console.log('Running scraper:', new Date(Date.now()).toLocaleString('hu'));

    await scrapeCategories();
    console.log('Categories updated!');

    await scrapeImages();
    console.log('Images updated!');

    const shuffledImages = await Images.aggregate<ImageWithId>([{ $sample: { size: 100 } }]);
    const arrayOfImages = await shuffledImages.toArray();
    await Images.insertMany(arrayOfImages);
}