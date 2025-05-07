export interface BibleStructure {
  [book: string]: {
    chapters: {
      [chapter: string]: string[];
    };
  };
}

export async function fetchBibleStructure(): Promise<BibleStructure> {
  const res = await fetch('/bible_data.json');
  if (!res.ok) throw new Error('Failed to load bible data');
  return res.json();
}

export function getBookList(bible: BibleStructure): string[] {
  return Object.keys(bible);
}

export function getChapterCount(bible: BibleStructure, book: string): number {
  return bible[book] ? Object.keys(bible[book].chapters).length : 0;
} 