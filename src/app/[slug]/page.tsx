import { Metadata } from 'next';
import { BiblePageClient } from './BiblePageClient';
import { getBookList, getChapterCount } from '@/lib/bibleUtils';
import { Verse } from '@/types/bible';
import _bibleData from '@/lib/bible_data.json';
import { BibleData } from '@/types/bibleData';

const bibleData = _bibleData as BibleData;

type Props = {
  params: { slug: string };
};

// Helper to fetch verses for a chapter from the local JSON file
async function getVersesForChapter(book: string, chapter: number): Promise<Verse[]> {
  
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
  const bookList = getBookList(bibleData);

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

  const baseDescription =
    'Read with in-depth AI commentary on every verse and semantic search to find related passages.';

  if (!foundBook || !chapterNum) {
    return {
      title: 'Berean Bible',
      description: baseDescription,
    };
  }

  const verses = await getVersesForChapter(foundBook, chapterNum);

  let pageTitle: string;
  let description: string;
  let canonical: string;

  if (verseNum && verses[verseNum - 1]) {
    pageTitle = `${foundBook} ${chapterNum}:${verseNum}`;
    description = verses[verseNum - 1].text;
    canonical = `/${foundBook.replace(/ /g, '-').toLowerCase()}-${chapterNum}-${verseNum}`;
  } else {
    pageTitle = `${foundBook} ${chapterNum}`;
    description =
      verses.length > 0
        ? verses[0].text.substring(0, 155) + (verses[0].text.length > 155 ? '…' : '')
        : baseDescription;
    canonical = `/${foundBook.replace(/ /g, '-').toLowerCase()}-${chapterNum}`;
  }

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description,
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = params;
  const bookList = getBookList(bibleData);

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
  const foundBook = bookList.find(b => b.toLowerCase() === bookName.toLowerCase()) || 'Genesis';
  const chapterCount = getChapterCount(bibleData, foundBook);
  const validatedChapter = (chapterNum && chapterNum > 0 && chapterNum <= chapterCount) ? chapterNum : 1;
  const initialVerses = await getVersesForChapter(foundBook, validatedChapter);

  return <BiblePageClient slug={slug} initialVerses={initialVerses} bibleStructure={bibleData} />;
} 