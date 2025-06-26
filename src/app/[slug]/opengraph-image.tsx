import { ImageResponse } from 'next/og';

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
  const { slug } = params;
  const { bookNameSlug, chapterNum } = await getBookAndChapterDetails(slug);
  
  // Fetch Bible data. Using fetch as 'fs' is not available in the Edge runtime.
  // This relies on the file being in the public folder.
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const bibleData = await fetch(`${baseUrl}/bible_data.json`).then((res) => res.json());

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

  // Font fetching
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
} 