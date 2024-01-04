export type BookCategory = {
    name: string;
    url: string;
    images: Image[];
}

export type Image = {
    url: string;
    width: number;
    height: number;
}