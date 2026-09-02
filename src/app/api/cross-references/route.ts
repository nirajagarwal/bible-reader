import { NextResponse } from 'next/server';
import { callBibleMcpTool } from '@/lib/bibleMcp';
import type { CrossReference } from '@/types/bible';

const OSIS_TO_BOOK: Record<string, string> = {
  Gen: 'Genesis', Exod: 'Exodus', Lev: 'Leviticus', Num: 'Numbers',
  Deut: 'Deuteronomy', Josh: 'Joshua', Judg: 'Judges', Ruth: 'Ruth',
  '1Sam': '1 Samuel', '2Sam': '2 Samuel', '1Kgs': '1 Kings', '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', Ezra: 'Ezra', Neh: 'Nehemiah',
  Esth: 'Esther', Job: 'Job', Ps: 'Psalms', Prov: 'Proverbs',
  Eccl: 'Ecclesiastes', Song: 'Song of Solomon', Isa: 'Isaiah',
  Jer: 'Jeremiah', Lam: 'Lamentations', Ezek: 'Ezekiel', Dan: 'Daniel',
  Hos: 'Hosea', Joel: 'Joel', Amos: 'Amos', Obad: 'Obadiah',
  Jonah: 'Jonah', Mic: 'Micah', Nah: 'Nahum', Hab: 'Habakkuk',
  Zeph: 'Zephaniah', Hag: 'Haggai', Zech: 'Zechariah', Mal: 'Malachi',
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John',
  Acts: 'Acts', Rom: 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians',
  Gal: 'Galatians', Eph: 'Ephesians', Phil: 'Philippians', Col: 'Colossians',
  '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians', '1Tim': '1 Timothy',
  '2Tim': '2 Timothy', Titus: 'Titus', Phlm: 'Philemon', Heb: 'Hebrews',
  Jas: 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John',
  '2John': '2 John', '3John': '3 John', Jude: 'Jude', Rev: 'Revelation',
};

function parseOsisRef(
  osisRef: string,
): { book: string; chapter: number; verse: number; label: string } | null {
  const firstPart = osisRef.split('-')[0];
  const parts = firstPart.split('.');
  if (parts.length < 3) return null;

  const verse = parseInt(parts[parts.length - 1], 10);
  const chapter = parseInt(parts[parts.length - 2], 10);
  const abbrev = parts.slice(0, parts.length - 2).join('.');
  const book = OSIS_TO_BOOK[abbrev];
  if (!book || isNaN(chapter) || isNaN(verse)) return null;

  let label = `${book} ${chapter}:${verse}`;

  if (osisRef.includes('-')) {
    const secondPart = osisRef.split('-')[1];
    const sp = secondPart.split('.');
    if (sp.length >= 3) {
      const v2 = parseInt(sp[sp.length - 1], 10);
      const c2 = parseInt(sp[sp.length - 2], 10);
      const abbrev2 = sp.slice(0, sp.length - 2).join('.');
      const book2 = OSIS_TO_BOOK[abbrev2] ?? abbrev2;
      if (book2 === book && c2 === chapter) {
        label = `${book} ${chapter}:${verse}–${v2}`;
      } else {
        label = `${book} ${chapter}:${verse} – ${book2} ${c2}:${v2}`;
      }
    }
  }

  return { book, chapter, verse, label };
}

function parseCrossReferences(raw: string): CrossReference[] {
  const results: CrossReference[] = [];
  const lineRegex = /^\[([^\]]+)\] \(votes: (\d+)\) (.+)$/;

  for (const line of raw.split('\n')) {
    const match = line.trim().match(lineRegex);
    if (!match) continue;
    const [, osisRef, votesStr, text] = match;
    const parsed = parseOsisRef(osisRef);
    if (!parsed) continue;
    results.push({
      reference: parsed.label,
      book: parsed.book,
      chapter: parsed.chapter,
      verse: parsed.verse,
      text,
      votes: parseInt(votesStr, 10),
    });
  }

  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { error: 'reference query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const raw = await callBibleMcpTool('get_cross_references', {
      reference,
      limit: 20,
    });
    const crossRefs = parseCrossReferences(raw);
    return NextResponse.json({ crossRefs });
  } catch (error) {
    console.error('Cross-references error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cross-references' },
      { status: 500 },
    );
  }
}
