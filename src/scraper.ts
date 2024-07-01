import * as cheerio from 'cheerio';
import { Categories, Category } from './categories/category.model';
import Image, { ImageWithId, Images } from './images/image.model';
import probe from 'probe-image-size';

const BASE_URL = "https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents";

type gitHubItem = {
    name: string,
    path: string
    contentType: 'directory' | 'file'
};

const scrapeCategories = async ():Promise<void> => {
    try {
        const response = await fetch(BASE_URL, {
            headers: {
                'Authorization': 'Bearer ' + process.env.GITHUB_PAT 
            }
        });
        const body: any[] = await response.json();

        const categories: Category[] = body
        .filter((data: any) => data.type === 'dir')
        .map(data => ({
            name: data.name,
            url: data.url,
            imageCount: 0,
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
        const response = await fetch(category.url, {
            headers: {
                'Authorization': 'Bearer ' + process.env.GITHUB_PAT 
            }
        });
        try {
            const body: any[] = await response.json();

            let images = body
            .filter(item => item.type === 'file')
            .map<Image>(item => ({
                category: category.name,
                url: item.download_url,
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

            await Categories.updateOne({ _id: category._id }, { $set: { imageCount: images.length }})

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
    
    const numberOfImages = await Images.countDocuments();
    const shuffledImages = await Images.aggregate<ImageWithId>([{ $sample: { size: numberOfImages * 3 } }]);
    const arrayOfImages = await shuffledImages.toArray();
    
    await Images.drop();
    await Images.insertMany(arrayOfImages);
}