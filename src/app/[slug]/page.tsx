import { Metadata } from 'next';
import { BiblePageClient } from './BiblePageClient';
import { fetchBibleStructure } from '@/lib/bibleData';
import { getBookList, getChapterCount } from '@/lib/bibleUtils';
import { Verse } from '@/types/bible';
import path from 'path';
import fs from 'fs/promises';

type Props = {
  params: { slug: string };
};

// Helper to fetch verses for a chapter from the local JSON file
async function getVersesForChapter(book: string, chapter: number): Promise<Verse[]> {
  const filePath = path.resolve(process.cwd(), 'public/bible_data.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const bibleData = JSON.parse(fileContent);
  
  if (bibleData[book] && bibleData[book].chapters[chapter]) {
    return bibleData[book].chapters[chapter].map((text: string, index: number) => ({
      book,
      chapter,
      verse: index + 1,
      text,
    }));
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const bibleStructure = await fetchBibleStructure();
  const bookList = getBookList(bibleStructure);

  const parts = slug.split('-');
  let verseNum: number | null = null;
  let chapterNum: number | null = null;
  let bookParts: string[] = [];

  if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
    const lastPart = parseInt(parts.pop() as string);
    if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
      verseNum = lastPart;
      chapterNum = parseInt(parts.pop() as string);
      bookParts = parts;
    } else {
      chapterNum = lastPart;
      bookParts = parts;
    }
  } else {
    bookParts = parts;
    chapterNum = 1;
  }
  const bookName = bookParts.join(' ');
  const foundBook = bookList.find(b => b.toLowerCase() === bookName.toLowerCase());

  const baseTitle = 'Berean Bible Reader';
  const baseDescription = 'Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.';

  if (!foundBook || !chapterNum) {
    return {
      title: baseTitle,
      description: baseDescription,
    };
  }
  
  const verses = await getVersesForChapter(foundBook, chapterNum);
  
  let title = `${baseTitle} - ${foundBook} ${chapterNum}`;
  let description;

  if (verseNum && verses[verseNum - 1]) {
    title = `${baseTitle} - ${foundBook} ${chapterNum}:${verseNum}`;
    description = verses[verseNum - 1].text;
  } else {
    description = verses.length > 0 ? `${verses[0].text.substring(0, 150)}... ${baseDescription}` : baseDescription;
  }

  const ogDescription = verses.length > 0 ? verses[0].text.substring(0, 150) + '...' : baseDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(ogDescription)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(ogDescription)}`],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = params;
  const bibleStructure = await fetchBibleStructure();
  const bookList = getBookList(bibleStructure);

  const parts = slug.split('-');
  const lastPartIsNum = !isNaN(parseInt(parts[parts.length - 1]));
  let bookName, chapterNum;

  if(lastPartIsNum) {
      chapterNum = parseInt(parts.pop() as string);
      bookName = parts.join(' ');
  } else {
      bookName = parts.join(' ');
      chapterNum = 1;
  }
  
  const foundBook = bookList.find(b => b.toLowerCase() === bookName.toLowerCase()) || 'Genesis';
  const chapterCount = getChapterCount(bibleStructure, foundBook);
  const validatedChapter = (chapterNum && chapterNum > 0 && chapterNum <= chapterCount) ? chapterNum : 1;
  const initialVerses = await getVersesForChapter(foundBook, validatedChapter);

  return <BiblePageClient slug={slug} initialVerses={initialVerses} bibleStructure={bibleStructure} />;
} 