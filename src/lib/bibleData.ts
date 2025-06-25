import fs from 'fs/promises';
import path from 'path';

export interface BibleStructure {
  [book: string]: {
    chapters: {
      [chapter: string]: string[];
    };
  };
}

export async function fetchBibleStructure(): Promise<BibleStructure> {
  const filePath = path.resolve(process.cwd(), 'public/bible_data.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
} 