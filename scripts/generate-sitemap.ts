import fs from 'fs';
import path from 'path';

// This is a placeholder. Replace with your actual domain.
const BASE_URL = 'https://berean-bible.vercel.app';

interface BibleStructure {
  [book: string]: {
    chapters: {
      [chapter: string]: any; // Value doesn't matter for sitemap
    };
  };
}

async function fetchLocalBibleStructure(): Promise<BibleStructure> {
  const filePath = path.resolve(process.cwd(), 'public/bible_data.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

function getBookList(bible: BibleStructure): string[] {
  return Object.keys(bible);
}

function getChapterCount(bible: BibleStructure, book: string): number {
  return bible[book] ? Object.keys(bible[book].chapters).length : 0;
}

async function generateSitemap() {
  try {
    console.log('Fetching Bible structure...');
    const bibleStructure = await fetchLocalBibleStructure();
    const books = getBookList(bibleStructure);
    
    const urls: string[] = [];

    // Add homepage
    urls.push(`
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.00</priority>
  </url>`);

    console.log('Generating chapter URLs...');
    for (const book of books) {
      const chapterCount = getChapterCount(bibleStructure, book);
      for (let chapter = 1; chapter <= chapterCount; chapter++) {
        const slug = `${book.replace(/ /g, '-').toLowerCase()}-${chapter}`;
        const url = `${BASE_URL}/${slug}`;
        urls.push(`
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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