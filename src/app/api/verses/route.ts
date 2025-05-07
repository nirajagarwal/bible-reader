import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');

  if (!book || !chapter) {
    return NextResponse.json(
      { error: 'Book and chapter parameters are required' },
      { status: 400 }
    );
  }

  try {
    const jsonPath = path.join(process.cwd(), 'public', 'bible_data.json');
    const data = await fs.readFile(jsonPath, 'utf-8');
    const bible = JSON.parse(data);

    const chapterVerses = bible[book]?.chapters?.[chapter];
    if (!chapterVerses) {
      return NextResponse.json(
        { error: 'Book or chapter not found' },
        { status: 404 }
      );
    }

    // Return as array of { verse: number, text: string }
    const verses = chapterVerses.map((text: string, idx: number) => ({
      verse: idx + 1,
      text,
    })).filter((v: any) => v.text && v.text.length > 0);

    return NextResponse.json({ verses });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load bible data' },
      { status: 500 }
    );
  }
} 