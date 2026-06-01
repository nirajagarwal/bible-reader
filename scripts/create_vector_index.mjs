import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config({ path: '.env.local' });

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const verses = client.db('bible').collection('verses');

  console.log('Creating vector_bible search index on bible.verses...');
  const name = await verses.createSearchIndex({
    name: 'vector_bible',
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'embedding',
          numDimensions: 768,
          similarity: 'cosine',
        },
      ],
    },
  });
  console.log('Created:', name);
  console.log('Note: index build is async — usually 1–3 minutes before searches return results.');
} catch (err) {
  console.error('ERROR:', err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
