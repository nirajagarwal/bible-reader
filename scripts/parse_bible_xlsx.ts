import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input and output paths
const xlsxPath = path.join(__dirname, '../public/bible_data.xlsx');
const jsonPath = path.join(__dirname, '../public/bible_data.json');

// Read the workbook
const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get as array of arrays

// Data structures
const books: Record<string, { chapters: Record<string, string[]> }> = {};
let verseCount = 0;
let chapterSet = new Set<string>();

// Skip header row if present
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length < 3) continue;
  const ref = String(row[1]).trim(); // e.g. Genesis 1:1
  const text = String(row[2]).trim();

  // Parse reference
  const match = ref.match(/^(.*?)\s(\d+):(\d+)$/);
  if (!match) continue;
  const book = match[1];
  const chapter = match[2];
  const verse = match[3];

  if (!books[book]) books[book] = { chapters: {} };
  if (!books[book].chapters[chapter]) books[book].chapters[chapter] = [];
  books[book].chapters[chapter][parseInt(verse, 10) - 1] = text;
  verseCount++;
  chapterSet.add(`${book}:${chapter}`);
}

// Write JSON output
fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2));

// Print summary
const bookNames = Object.keys(books);
console.log('Bible Data Summary:');
console.log(`Books: ${bookNames.length}`);
console.log(`Chapters: ${chapterSet.size}`);
console.log(`Verses: ${verseCount}`);
if (bookNames.length > 0) {
  const firstBook = bookNames[0];
  const firstChapter = Object.keys(books[firstBook].chapters)[0];
  console.log('First book sample:', firstBook, books[firstBook].chapters[firstChapter].slice(0, 3));
} 