import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'knowra';
const COLLECTION_NAME = 'bible';
const SIMILARITY_THRESHOLD = 0.7; // Adjust as needed

// Define the book order for proper sorting
const BOOK_ORDER = [
  // Old Testament (39 books)
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament (27 books)
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const OLD_TESTAMENT_BOOKS = BOOK_ORDER.slice(0, 39);
const NEW_TESTAMENT_BOOKS = BOOK_ORDER.slice(39);

function sortSearchResults(results: any[]) {
  return results.sort((a, b) => {
    const aBookIndex = BOOK_ORDER.indexOf(a.book);
    const bBookIndex = BOOK_ORDER.indexOf(b.book);
    
    // Sort by book order first
    if (aBookIndex !== bBookIndex) {
      return aBookIndex - bBookIndex;
    }
    
    // Then by chapter
    if (a.chapter !== b.chapter) {
      return a.chapter - b.chapter;
    }
    
    // Finally by verse
    return a.verse - b.verse;
  });
}

function separateByTestament(results: any[]) {
  const oldTestament = results.filter(result => OLD_TESTAMENT_BOOKS.includes(result.book));
  const newTestament = results.filter(result => NEW_TESTAMENT_BOOKS.includes(result.book));
  
  return {
    oldTestament: sortSearchResults(oldTestament),
    newTestament: sortSearchResults(newTestament)
  };
}

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

    // Check if the query is a full verse text from our DB, indicating a "related verses" search
    const verseDoc = await collection.findOne({ text: query });

    if (verseDoc) {
      // If it's a related verse search, check for cached 'relatedVerses'
      if (verseDoc.relatedVerses) {
        const separatedResults = separateByTestament(verseDoc.relatedVerses);
        return NextResponse.json(separatedResults);
      }
    }

    const queryEmbedding = await model.embedContent(query);
    const queryVector = queryEmbedding.embedding.values;

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_bible',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 150,
          limit: 50,
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
    const separatedResults = separateByTestament(results);

    if (verseDoc) {
      // For a "related verses" search, store results in the document
      await collection.updateOne(
        { _id: verseDoc._id },
        { $set: { relatedVerses: results } }
      );
    }

    return NextResponse.json(separatedResults);

  } catch (error) {
    console.error('Error during semantic search:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
} 