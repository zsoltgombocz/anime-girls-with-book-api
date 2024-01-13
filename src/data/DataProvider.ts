import { BookCategory, Image, PaginatedImages } from "../types";
import fs from 'node:fs/promises';
import _lodash from 'lodash';
import seedrandom from 'seedrandom';

interface DataProviderInterface {
    fileName: string;
    images: Image[];
    categories: BookCategory[];
    seed: string;

    load: () => Promise<DataProvider>;
    getCategories: () => BookCategory[];
    getImages: () => Image[];
    getImagesFromCategory: (category: string) => Image[];
}

export class DataProvider implements DataProviderInterface {
    fileName: string;
    categories: BookCategory[] = [];
    images: Image[] = [];
    seed: string = 'default';

    constructor(fileName: string, seed: string) {
        this.fileName = fileName;
        this.seed = seed;
    }

    load = async (): Promise<DataProvider> => {
        try {
            const data = await fs.readFile(`${process.cwd()}/src/data/${this.fileName}`, 'utf8');
            const jsonData = JSON.parse(data);

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

    getImages = (): Image[] => {
        return this.shuffleSeeded(this.images, this.seed);
    }

    getImagesFromCategory = (category: string): Image[] => {
        return this.getImages().filter(image => image.category === category);
    }

    getPaginatedImages = (page: number | null, limit: number, category: string | null = null): PaginatedImages => {
        let images = [];
        let currentPage = page;

        if (category === null) {
            images = this.getImages();
        } else {
            images = this.getImagesFromCategory(category);
        }

        if (currentPage === null) {
            return {
                currentPage: 1,
                totalPages: 1,
                totalItems: images.length,
                images
            };
        } else {
            const startIndex = (currentPage - 1) * limit;
            const endIndex = currentPage * limit;

            return {
                currentPage,
                totalPages: Math.ceil(images.length / limit),
                totalItems: images.length,
                images: images.slice(startIndex, endIndex)
            };
        }
    }

    shuffleSeeded = <T>(array: T[], seed: string): T[] => {
        seedrandom(seed, { global: true });
        const _ = _lodash.runInContext();
        return _.shuffle(array);
    }
}