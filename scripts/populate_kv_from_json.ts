import { createClient } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kvUrl = process.env.KV_KV_REST_API_URL;
const kvToken = process.env.KV_KV_REST_API_TOKEN;

if (!kvUrl || !kvToken) {
  console.error('Could not find Vercel KV connection details.');
  throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set in .env.local');
}

const kv = createClient({
  url: kvUrl,
  token: kvToken,
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