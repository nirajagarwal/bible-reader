import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://bereanbible.online';
const LAST_MOD = new Date().toISOString().split('T')[0];

interface BibleData {
  [book: string]: {
    chapters: { [chapter: string]: string[] };
  };
}

const filePath = path.resolve(process.cwd(), 'src/lib/bible_data.json');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const bibleData: BibleData = JSON.parse(fileContent);

function getBookList(bible: BibleData): string[] {
  return Object.keys(bible);
}

function getChapterCount(bible: BibleData, book: string): number {
  return bible[book] ? Object.keys(bible[book].chapters).length : 0;
}

async function generateSitemap() {
  try {
    console.log('Fetching Bible structure...');
    const books = getBookList(bibleData);
    
    const urls: string[] = [];

    // Add homepage
    urls.push(`
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <priority>1.00</priority>
  </url>`);

    console.log('Generating chapter URLs...');
    for (const book of books) {
      const chapterCount = getChapterCount(bibleData, book);
      for (let chapter = 1; chapter <= chapterCount; chapter++) {
        const slug = `${book.replace(/ /g, '-').toLowerCase()}-${chapter}`;
        const url = `${BASE_URL}/${slug}`;
        urls.push(`
  <url>
    <loc>${url}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent);

    console.log(`Sitemap generated successfully at ${sitemapPath}`);
    console.log(`${urls.length} URLs were added to the sitemap.`);

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap(); 