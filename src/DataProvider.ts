import { BookCategory, Image } from "./types";
import fs from 'node:fs/promises';

interface DataProviderInterface {
    fileName: string;
    images: Image[];
    categories: BookCategory[];

    load: () => Promise<DataProvider>;
    getCategories: () => BookCategory[];
    getAllImages: () => Image[];
    getImagesFromCategory: (category: string) => Image[];
}

export class DataProvider implements DataProviderInterface {
    fileName: string;
    categories: BookCategory[] = [];
    images: Image[] = [];

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    load = async (): Promise<DataProvider> => {
        try {
            const data = await fs.readFile(`${process.cwd()}/src/data/${this.fileName}`, 'utf8');
            const jsonData = JSON.parse(data);

            //Loop through data entries. Every object in this data is a category containing the images.
            //Create the categories and the images array in logical form.
            for (let i = 0; i < jsonData.length; i++) {
                const category = jsonData[i];

                this.categories.push({
                    name: category.name,
                    url: category.url,
                } as BookCategory);

                category.content.map((image: any) => this.images.push({
                    ...image,
                    category: category.name
                } as Image));
            }

            return this;
        } catch (error: any) {
            console.log(`Error loading file to data provider! \nError: ${error.message}`)
            return this;
        }
    }

    getCategories = (): BookCategory[] => {
        return this.categories;
    }

    getAllImages = (): Image[] => {
        return this.images;
    }

    getImagesFromCategory = (category: string): Image[] => {
        return this.images.filter(image => image.category === category);
    }
}