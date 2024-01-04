import { BookCategory } from "./types";
import fs from 'node:fs/promises';

interface DataProviderInterface {
    fileName: string;
    data: BookCategory[],

    load: () => Promise<DataProvider>;
    getCategories: () => string[];
}

export class DataProvider implements DataProviderInterface {
    fileName: string;
    data: BookCategory[] = [];

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    load = async (): Promise<DataProvider> => {
        try {
            const data = await fs.readFile(`${process.cwd()}/src/data/${this.fileName}`, 'utf8');
            const jsonData = JSON.parse(data);
            //Loop through data entries. Every object in this data is a category containing the images.
            for (let i = 0; i < jsonData.length; i++) {
                const category = jsonData[i];

                this.data.push({
                    name: category.name,
                    url: category.url,
                } as BookCategory);
            }

            return this;
        } catch (error: any) {
            console.log(`Error loading file to data provider! \nError: ${error.message}`)
            return this;
        }
    }

    getCategories = (): string[] => {
        return this.data.map<string>((category: BookCategory) => category.name);
    }
}