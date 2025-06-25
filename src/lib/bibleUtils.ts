import { BibleStructure } from './bibleData';

export function getBookList(bible: BibleStructure): string[] {
  return Object.keys(bible);
}

export function getChapterCount(bible: BibleStructure, book: string): number {
  return bible[book] ? Object.keys(bible[book].chapters).length : 0;
} 