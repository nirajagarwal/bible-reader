import { ImageResponse } from 'next/og';
import _bibleData from '@/lib/bible_data.json';
import { BibleData } from '@/types/bibleData';
import { getBookList } from '@/lib/bibleUtils';

export const runtime = 'edge';
export const alt = 'Berean Bible chapter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const bibleData = _bibleData as BibleData;

function parseSlug(slug: string) {
  const parts = slug.split('-');
  let verseNum: number | null = null;
  let chapterNum: number | null = null;
  let bookParts: string[] = [];

  if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
    const lastPart = parseInt(parts.pop() as string);
    if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
      verseNum = lastPart;
      chapterNum = parseInt(parts.pop() as string);
      bookParts = parts;
    } else {
      chapterNum = lastPart;
      bookParts = parts;
    }
  } else {
    bookParts = parts;
    chapterNum = 1;
  }

  const bookName = bookParts.join(' ');
  const bookList = getBookList(bibleData);
  const foundBook = bookList.find((b) => b.toLowerCase() === bookName.toLowerCase());
  return { book: foundBook, chapter: chapterNum, verse: verseNum };
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  const { book, chapter, verse } = parseSlug(params.slug);

  let snippet = 'In-depth AI commentary and semantic search for every verse.';
  let reference = 'Berean Bible';

  if (book && chapter && bibleData[book]?.chapters?.[chapter]) {
    const verses = bibleData[book].chapters[chapter];
    if (verse && verses[verse - 1]) {
      snippet = verses[verse - 1];
      reference = `${book} ${chapter}:${verse}`;
    } else {
      snippet = verses[0] ?? snippet;
      reference = `${book} ${chapter}`;
    }
  }

  const trimmed = snippet.length > 220 ? snippet.slice(0, 217).trim() + '…' : snippet;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          backgroundColor: '#FBF6EC',
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(184,146,74,0.18) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(122,46,41,0.12) 0%, transparent 50%)',
          fontFamily: 'Georgia, serif',
          color: '#1F1A14',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              backgroundColor: '#7A2E29',
              color: '#B8924A',
              fontSize: 40,
              fontWeight: 700,
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            B
          </div>
          <div
            style={{
              color: '#7A2E29',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            Berean Bible
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              lineHeight: 1.05,
              color: '#7A2E29',
              fontStyle: 'italic',
              letterSpacing: '-0.005em',
            }}
          >
            {reference}
          </div>
          <div
            style={{
              width: 100,
              height: 3,
              backgroundColor: '#B8924A',
            }}
          />
          <div
            style={{
              fontSize: 34,
              color: '#1F1A14',
              lineHeight: 1.4,
              maxWidth: 1040,
              fontFamily: 'Georgia, serif',
            }}
          >
            {trimmed}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            fontSize: 20,
            color: '#5C5043',
            borderTop: '1px solid #E7DCC4',
            paddingTop: 22,
          }}
        >
          <span style={{ color: '#B8924A', fontWeight: 700, letterSpacing: '0.05em' }}>bereanbible.online</span>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
            AI commentary · Semantic search
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
