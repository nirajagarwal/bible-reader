import { BibleData } from '@/types/bibleData';

export function getBookList(bible: BibleData): string[] {
  return Object.keys(bible);
}

export function getChapterCount(bible: BibleData, book: string): number {
  return bible[book] ? Object.keys(bible[book].chapters).length : 0;
} 