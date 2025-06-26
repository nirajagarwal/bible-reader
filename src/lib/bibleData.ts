import path from 'path';
import fs from 'fs/promises';
import { Testament } from '@/types/bible';
import _bibleData from '@/lib/bible_data.json';
import { BibleData } from '@/types/bibleData';

const bibleData: BibleData = _bibleData;

let bibleStructureCache: any = null;

export async function fetchBibleStructure() {
  if (bibleStructureCache) {
    return bibleStructureCache;
  }
  
  bibleStructureCache = Object.keys(bibleData).reduce((acc, book) => {
    const bookData = bibleData[book];
    acc[book] = {
      testament: bookData.testament as Testament,
      chapters: Object.keys(bookData.chapters).length
    };
    return acc;
  }, {} as { [key: string]: { testament: Testament, chapters: number } });

  return bibleStructureCache;
} 