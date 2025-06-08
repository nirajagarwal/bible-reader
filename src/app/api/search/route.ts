import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'knowra';
const COLLECTION_NAME = 'bible';
const SIMILARITY_THRESHOLD = 0.75; // Adjust as needed

if (!GEMINI_API_KEY || !MONGO_URI) {
  throw new Error('API keys are not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const client = new MongoClient(MONGO_URI);

async function connectToDb() {
    await client.connect();
    return client.db(DB_NAME);
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const db = await connectToDb();
    const collection = db.collection(COLLECTION_NAME);

    const queryEmbedding = await model.embedContent(query);
    const queryVector = queryEmbedding.embedding.values;

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_bible',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          book: 1,
          chapter: 1,
          verse: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          score: { $gte: SIMILARITY_THRESHOLD },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error during semantic search:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
} 