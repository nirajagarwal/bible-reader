import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input and output paths
const xlsxPath = path.join(__dirname, '../public/bible_data.xlsx');
const jsonPath = path.join(__dirname, '../src/lib/bible_data.json');

// Read the workbook
const workbook = XLSX.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get as array of arrays

// Data structures
const bibleData: Record<string, { chapters: Record<string, string[]>, testament: string }> = {};
let verseCount = 0;
let chapterSet = new Set<string>();

// Skip header row if present
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length < 3) continue;
  const ref = String(row[1]).trim(); // e.g. Genesis 1:1
  const text = String(row[2]).trim();
  const testament = String(row[3]).trim();

  // Parse reference
  const match = ref.match(/^(.*?)\s(\d+):(\d+)$/);
  if (!match) continue;
  const book = match[1];
  const chapter = match[2];
  const verse = match[3];

  if (!bibleData[book]) bibleData[book] = { chapters: {}, testament: testament };
  if (!bibleData[book].chapters[chapter]) bibleData[book].chapters[chapter] = [];
  bibleData[book].chapters[chapter][parseInt(verse, 10) - 1] = text;
  verseCount++;
  chapterSet.add(`${book}:${chapter}`);
}

// Filter out books with no chapters or chapters with no verses
for (const book in bibleData) {
  for (const chapter in bibleData[book].chapters) {
    const verses = bibleData[book].chapters[chapter].filter(verse => verse !== null && verse !== '');
    if (verses.length === 0) {
      delete bibleData[book].chapters[chapter];
    } else {
      bibleData[book].chapters[chapter] = verses;
    }
  }
  if (Object.keys(bibleData[book].chapters).length === 0) {
    delete bibleData[book];
  }
}

// Write JSON output
fs.writeFileSync(jsonPath, JSON.stringify(bibleData, null, 2));

// Print summary
const bookNames = Object.keys(bibleData);
console.log('Bible Data Summary:');
console.log(`Books: ${bookNames.length}`);
console.log(`Chapters: ${chapterSet.size}`);
console.log(`Verses: ${verseCount}`);
if (bookNames.length > 0) {
  const firstBook = bookNames[0];
  const firstChapter = Object.keys(bibleData[firstBook].chapters)[0];
  console.log('First book sample:', firstBook, bibleData[firstBook].chapters[firstChapter].slice(0, 3));
}

console.log('Bible data has been parsed and saved to bible_data.json'); 