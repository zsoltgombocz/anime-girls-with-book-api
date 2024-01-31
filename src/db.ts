import { MongoClient, Collection, WithId  } from 'mongodb';
import * as z from 'zod';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/anime-girls-with-books-api'

export const client = new MongoClient(MONGO_URL);
export const db = client.db();

export const testConnection = async (): Promise<boolean> => {
    try {
        await client.connect();

        console.log('Database is ready to use.');
        return true;
    } catch (error: any) {
        console.error('Error testing connection:', error?.message)
        return false;
    }
}