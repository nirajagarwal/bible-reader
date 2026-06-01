import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config({ path: '.env.local' });

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const verses = client.db('bible').collection('verses');
  for (let i = 0; i < 60; i++) {
    const indexes = await verses.listSearchIndexes('vector_bible').toArray();
    const idx = indexes[0];
    const status = idx?.status ?? 'NOT_FOUND';
    const queryable = idx?.queryable ?? false;
    process.stdout.write(`[${(i*5).toString().padStart(3)}s] status=${status} queryable=${queryable}\n`);
    if (queryable) {
      console.log('Index is ready.');
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
  }
} finally {
  await client.close();
}
