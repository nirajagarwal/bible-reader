import { NextResponse } from 'next/server';
import _bibleData from '@/lib/bible_data.json';
import { BibleData } from '@/types/bibleData';
import { Verse } from '@/types/bible';

const bibleData = _bibleData as BibleData;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');

  if (!book || !chapter) {
    return NextResponse.json({ error: 'Book and chapter are required' }, { status: 400 });
  }

  try {
    const chapterNum = parseInt(chapter, 10);
    
    if (bibleData[book] && bibleData[book].chapters[chapterNum]) {
      const verses: Verse[] = bibleData[book].chapters[chapterNum].map((text: string, index: number) => ({
        book,
        chapter: chapterNum,
        verse: index + 1,
        text
      }));
      return NextResponse.json(verses);
    } else {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading bible data:', error);
    return NextResponse.json({ error: 'Failed to load bible data' }, { status: 500 });
  }
} 