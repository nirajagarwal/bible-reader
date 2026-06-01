import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config({ path: '.env.local' });

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db('bible');
  console.log('--- collections in "bible" db ---');
  for (const c of await db.listCollections().toArray()) console.log(' ', c.name);

  const verses = db.collection('verses');
  console.log('--- verses count ---', await verses.estimatedDocumentCount());

  const sample = await verses.findOne({}, { projection: { embedding: 0 } });
  console.log('--- sample (no embedding) ---');
  console.log(sample);

  const withEmb = await verses.findOne({}, { projection: { embedding: 1 } });
  console.log('--- embedding shape ---',
    withEmb?.embedding ? `length=${withEmb.embedding.length}, first 3: [${withEmb.embedding.slice(0,3).join(', ')}]` : 'NO EMBEDDING FIELD');

  console.log('--- search indexes ---');
  try {
    const indexes = await verses.listSearchIndexes().toArray();
    if (indexes.length === 0) console.log('  (none)');
    else console.log(JSON.stringify(indexes, null, 2));
  } catch (e) {
    console.log(' (listSearchIndexes failed):', e.message);
  }
} catch (err) {
  console.error('ERROR:', err.message);
} finally {
  await client.close();
}
