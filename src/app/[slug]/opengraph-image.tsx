import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import _bibleData from '@/lib/bible_data.json';
import { BibleData } from '@/types/bibleData';

const bibleData: BibleData = _bibleData;

export const runtime = 'edge';

export const alt = 'Berean Bible Reader';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Note: This is a simplified version of the logic in page.tsx
// It's intentionally kept simple to work in the Edge runtime.
async function getBookAndChapterDetails(slug: string) {
  const parts = slug.split('-');
  let chapterNum: number | null = null;
  let bookParts: string[] = [];

  // Very basic slug parsing
  if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
      chapterNum = parseInt(parts.pop() as string);
      bookParts = parts;
  } else {
      bookParts = parts;
      chapterNum = 1;
  }
  const bookNameSlug = bookParts.join(' ');
  return { bookNameSlug, chapterNum };
}

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const { bookNameSlug, chapterNum } = await getBookAndChapterDetails(slug);
    
    const headersList = headers();
    const host = headersList.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const bookList = Object.keys(bibleData);
    const foundBook = bookList.find(b => b.toLowerCase() === bookNameSlug.toLowerCase());

    let title = 'Berean Bible Reader';
    let description = 'Read with in-depth AI commentary and semantic search.';

    if (foundBook && chapterNum && bibleData[foundBook]?.chapters[chapterNum]) {
      title = `${foundBook} ${chapterNum}`;
      const verses = bibleData[foundBook].chapters[chapterNum];
      if (verses.length > 0 && typeof verses[0] === 'string') {
        description = verses[0].substring(0, 150) + '...';
      }
    }

    const fontData = await fetch(
      'https://fonts.gstatic.com/s/specialelite/v15/XLYgIZbkc4JPUL5CVArG6RkIdHDo-Y_A.woff2'
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '40px',
            border: '20px solid #cbd5e0',
            fontFamily: '"Special Elite"',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#1a202c',
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.6,
              color: '#4a5568',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Special Elite',
            data: fontData,
            style: 'normal',
            weight: 400,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(`Error generating OG image: ${e.message}`);
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            border: '20px solid #fca5a5',
          }}
        >
          <h1 style={{ fontSize: 40, color: '#b91c1c' }}>Image Generation Failed</h1>
          <p style={{ fontSize: 24, color: '#4b5563', maxWidth: '80%', textAlign: 'center' }}>
            There was an error generating the preview image.
          </p>
          <p style={{ fontSize: 18, color: '#ef4444' }}>Error: {e.message}</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
} 