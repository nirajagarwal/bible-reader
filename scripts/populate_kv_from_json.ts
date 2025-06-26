import { createClient } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set in .env.local');
}

const kv = createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

async function populateKv() {
  console.log('Reading bible_data.json...');
  const jsonPath = path.join(__dirname, '../src/lib/bible_data.json');
  const bibleData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const books = Object.keys(bibleData);
  console.log(`Found ${books.length} books to process.`);

  for (const book of books) {
    try {
      const slug = book.replace(/ /g, '-').toLowerCase();
      console.log(`Setting data for ${slug}...`);
      const bookData = bibleData[book];
      await kv.hset(slug, { ...bookData, bookName: book });
    } catch (error) {
      console.error(`Failed to set data for ${book}:`, error);
    }
  }

  console.log('Successfully populated Vercel KV with Bible data.');
}

populateKv(); 