import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error(
    "MONGO_URI must be set. Did you forget to provide MongoDB connection string?",
  );
}

const client = new MongoClient(process.env.MONGO_URI);

let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db('ai-character-chat');
    console.log('Connected to MongoDB');
  }
  return db;
}

export { db, client };