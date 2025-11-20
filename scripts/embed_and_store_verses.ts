import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'knowra';
const COLLECTION_NAME = 'bible';

const CHUNK_SIZE = 99; // Stay under the 100 limit for batchEmbedContents
const RETRY_LIMIT = 5;
const RETRY_DELAY = 5000; // 5 seconds

if (!GEMINI_API_KEY || !MONGO_URI) {
  throw new Error(
    'Please provide GEMINI_API_KEY and MONGODB_URI in your .env file'
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-005' });
const client = new MongoClient(MONGO_URI);

async function embedAndStore() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Optional: Create an index on the 'embedding' field for vector search
    // You mentioned you will do this in Atlas, which is the recommended approach.
    // await collection.createIndex({ embedding: '2dsphere' });

    const jsonPath = path.join(process.cwd(), 'src', 'lib', 'bible_data.json');
    const bibleData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Flatten all verses into a single list to be chunked
    const allVerses = [];
    for (const book in bibleData) {
      for (const chapter in bibleData[book].chapters) {
        const verses = bibleData[book].chapters[chapter];
        for (let i = 0; i < verses.length; i++) {
          const verseNumber = i + 1;
          const verseText = verses[i];
          if (verseText && verseText.trim() !== '') {
            allVerses.push({
              book,
              chapter: parseInt(chapter, 10),
              verse: verseNumber,
              text: verseText,
            });
          }
        }
      }
    }

    // --- Resumability: Find where to start from ---
    const lastStoredVerse = await collection.findOne({}, { sort: { _id: -1 } });
    let startingIndex = 0;
    if (lastStoredVerse) {
        console.log(`Last verse found in DB: ${lastStoredVerse.book} ${lastStoredVerse.chapter}:${lastStoredVerse.verse}`);
        // Find the index of the last stored verse in our source data
        const resumeIndex = allVerses.findIndex(v => 
            v.book === lastStoredVerse.book &&
            v.chapter === lastStoredVerse.chapter &&
            v.verse === lastStoredVerse.verse
        );

        if (resumeIndex !== -1) {
            startingIndex = resumeIndex + 1;
            console.log(`Resuming script, skipping ${startingIndex} already processed verses.`);
        } else {
            console.log("Could not find last stored verse in source, starting from beginning.");
        }
    }

    if (startingIndex >= allVerses.length) {
        console.log("Database is already up to date.");
        return;
    }

    // --- Process in Chunks ---
    for (let i = startingIndex; i < allVerses.length; i += CHUNK_SIZE) {
      const batch = allVerses.slice(i, i + CHUNK_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil((allVerses.length - startingIndex) / CHUNK_SIZE)} (verses ${i + 1}-${i + batch.length} of ${allVerses.length})`);

      const textsToEmbed = batch.map((v) => v.text);
      let embeddings;

      // --- Retry Logic ---
      for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
        try {
          const result = await model.batchEmbedContents({
            requests: textsToEmbed.map((text) => ({
              content: { role: 'user', parts: [{ text }] },
            })),
          });
          embeddings = result.embeddings;
          console.log(`Successfully generated ${embeddings.length} embeddings.`);
          break; // Break loop on success
        } catch (error: any) {
          if (attempt < RETRY_LIMIT && error.status >= 500) {
            console.warn(`Attempt ${attempt} failed with server error (${error.status}). Retrying in ${RETRY_DELAY / 1000}s...`);
            await sleep(RETRY_DELAY);
          } else {
            console.error('An unrecoverable error occurred during embedding:', error);
            throw error; // Re-throw on final attempt or non-retriable error
          }
        }
      }
      
      if (!embeddings || embeddings.length !== batch.length) {
        console.warn(`Could not generate embeddings for this batch. Skipping.`);
        continue;
      }

      const documents = batch.map((verse, index) => ({
        ...verse,
        embedding: embeddings[index].values,
      }));

      await collection.insertMany(documents);
      console.log(`  ...stored ${documents.length} verses in MongoDB.`);
      
      // --- Rate Limiting ---
      await sleep(200); // 200ms delay between batches
    }

    console.log(`\nSuccessfully stored and embedded all verses.`);
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

embedAndStore(); 