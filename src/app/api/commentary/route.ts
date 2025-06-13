import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro-preview-06-05';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent';
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'knowra';
const COLLECTION_NAME = 'bible';
const COMMENTARY_RATE_LIMIT = parseInt(process.env.COMMENTARY_RATE_LIMIT_PER_DAY || '1000', 10);

if (!MONGO_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGO_URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGO_URI);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export async function POST(request: Request) {
  try {
    const { book, chapter, verse, text } = await request.json();

    if (!book || !chapter || !verse || !text) {
      return NextResponse.json(
        { error: 'Book, chapter, verse, and text are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    // 1. Check for existing commentary
    const verseDoc = await collection.findOne({ book, chapter, verse });

    if (verseDoc && verseDoc.commentary) {
      return NextResponse.json({ commentary: verseDoc.commentary });
    }

    // Rate limit check
    const rateLimitCollection = db.collection('bible_rate_limits');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const usage = await rateLimitCollection.findOneAndUpdate(
      { key: 'commentary_generation', date: today },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );

    const currentCount = usage?.value?.count || 1;

    if (currentCount > COMMENTARY_RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Commentary generation limit reached for today.' },
        { status: 429 }
      );
    }

    // 2. If not found, generate new commentary
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a Bible scholar that can synthesize diverse points of view into a modern and insightful commentary. 
                Provide a structured commentary on the following verse. 
                Where relevant, point out related verses or themes in the Bible to add context.
                Just the content, no preamble or postamble.
                Verse: ${text}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const newCommentary = data.candidates[0].content.parts[0].text;

    // 3. Store the new commentary in MongoDB
    await collection.updateOne(
      { book, chapter, verse },
      { $set: { commentary: newCommentary } },
      { upsert: true } // Creates the doc if it somehow doesn't exist
    );

    return NextResponse.json({ commentary: newCommentary });
  } catch (error) {
    console.error('Error in commentary route:', error);
    return NextResponse.json(
      { error: 'Failed to process commentary request' },
      { status: 500 }
    );
  }
} 