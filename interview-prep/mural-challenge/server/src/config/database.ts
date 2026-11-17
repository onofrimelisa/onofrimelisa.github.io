import { MongoClient, Db } from 'mongodb';

export async function connectToMongo(uri: string): Promise<{ db: Db; client: MongoClient }> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Create index on boardId for notes collection
  await db.collection('notes').createIndex({ boardId: 1 });

  console.log('Connected to MongoDB');
  return { db, client };
}
