'use client';

import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import { Verse, SearchResult } from '@/types/bible';
import localforage from 'localforage';
import { getChapterCount, getBookList } from '@/lib/bibleUtils';
import { useState, useEffect, useMemo } from 'react';
import { useSearch } from '@/context/SearchContext';

export function BiblePageClient({ slug, initialVerses, bibleStructure: initialBibleStructure }: { slug: string, initialVerses: Verse[], bibleStructure: any }) {
  const router = useRouter();
  const [currentBook, setCurrentBook] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [hasNextChapter, setHasNextChapter] = useState(false);
  const [hasPrevChapter, setHasPrevChapter] = useState(false);
  const [bibleStructure, setBibleStructure] = useState<any>(initialBibleStructure);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCommentaryDrawerOpen, setIsCommentaryDrawerOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const [isLoading, setIsLoading] = useState(true);

  const { otBooks, ntBooks } = useMemo(() => {
    if (!bibleStructure) return { otBooks: [], ntBooks: [] };
    const books = getBookList(bibleStructure);
    return {
      otBooks: books.slice(0, 39),
      ntBooks: books.slice(39),
    };
  }, [bibleStructure]);

  useEffect(() => {
    if (!bibleStructure) return;

    const parts = slug.split('-');
    let verse: number | null = null;
    let chapter: number | null = null;
    let bookParts: string[] = [];

    if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
        const lastPart = parseInt(parts.pop() as string);
        if (parts.length > 0 && !isNaN(parseInt(parts[parts.length - 1]))) {
            verse = lastPart;
            chapter = parseInt(parts.pop() as string);
            bookParts = parts;
        } else {
            chapter = lastPart;
            bookParts = parts;
        }
    } else {
        bookParts = parts;
        chapter = 1;
    }

    const book = bookParts.join(' ');
    const bookList = getBookList(bibleStructure);

    const foundBook = bookList.find(b => b.toLowerCase() === book.toLowerCase());

    if (foundBook && chapter) {
      const chapterCount = getChapterCount(bibleStructure, foundBook);
      if (chapter > 0 && chapter <= chapterCount) {
        setCurrentBook(foundBook);
        setCurrentChapter(chapter);
        setHighlightedVerse(verse);
        setTotalChapters(chapterCount);
        setHasNextChapter(chapter < chapterCount);
        setHasPrevChapter(chapter > 1);

        localforage.setItem('readingState', {
          book: foundBook,
          chapter: chapter,
          scrollPosition: 0,
        });

        setIsLoading(false);
      } else {
        const newSlug = `${foundBook.replace(/ /g, '-').toLowerCase()}-1`;
        router.replace(`/${newSlug}`);
      }
    } else {
        router.replace('/genesis-1');
    }
  }, [slug, bibleStructure, router]);

  useEffect(() => {
    const loadVerses = async () => {
      if (!currentBook || !currentChapter) return;
      // Avoid refetching if initial verses are for the current context
      if (
        initialVerses.length > 0 &&
        initialVerses[0].book === currentBook &&
        initialVerses[0].chapter === currentChapter
      ) {
        setVerses(initialVerses);
        return;
      }
      try {
        const response = await fetch(`/api/verses?book=${currentBook}&chapter=${currentChapter}`);
        if (!response.ok) throw new Error('Failed to fetch verses');
        const data = await response.json();
        setVerses(data.verses);
      } catch (error) {
        console.error('Error loading verses:', error);
      }
    };
    loadVerses();
  }, [currentBook, currentChapter, initialVerses]);

  const handleBookSelect = (book: string) => {
    const newSlug = `${book.replace(/ /g, '-').toLowerCase()}-1`;
    router.push(`/${newSlug}`);
  };

  const handleChapterSelect = (chapter: number) => {
    if (!currentBook) return;
    const newSlug = `${currentBook.replace(/ /g, '-').toLowerCase()}-${chapter}`;
    router.push(`/${newSlug}`);
  };

  const handleChapterChange = (direction: 'next' | 'prev') => {
    if (!currentBook || !currentChapter) return;
    const newChapter = direction === 'next' ? currentChapter + 1 : currentChapter - 1;
    const newSlug = `${currentBook.replace(/ /g, '-').toLowerCase()}-${newChapter}`;
    router.push(`/${newSlug}`);
  };

  const handleVerseSelectFromSearch = (book: string, chapter: number, verse: number) => {
    const newSlug = `${book.replace(/ /g, '-').toLowerCase()}-${chapter}-${verse}`;
    router.push(`/${newSlug}`);
  };

  const handleSearch = async (query?: string) => {
    const searchQueryToUse = typeof query === 'string' ? query : searchQuery;
    if (!searchQueryToUse.trim()) return;

    setIsSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setIsSearchDrawerOpen(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQueryToUse }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (err) {
      setSearchError('An error occurred while searching.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleCloseSearchDrawer = () => {
    setIsSearchDrawerOpen(false);
  };

  const handleOpenCommentaryDrawer = () => {
    setIsCommentaryDrawerOpen(true);
  };

  const handleCloseCommentaryDrawer = () => {
    setIsCommentaryDrawerOpen(false);
  };

  const navsHidden = isSearchDrawerOpen || isCommentaryDrawerOpen;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!navsHidden && !isLoading && (
        <Navigation
          currentBook={currentBook}
          onBookSelect={handleBookSelect}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onChapterChange={handleChapterChange}
          hasNextChapter={hasNextChapter}
          hasPrevChapter={hasPrevChapter}
          currentChapter={currentChapter}
          onChapterSelect={handleChapterSelect}
          totalChapters={totalChapters}
          otBooks={otBooks}
          ntBooks={ntBooks}
        />
      )}
      <BibleReader
        verses={verses}
        onChapterChange={handleChapterChange}
        hasNextChapter={hasNextChapter}
        hasPrevChapter={hasPrevChapter}
        highlightedVerse={highlightedVerse}
        onVerseSelectFromSearch={handleVerseSelectFromSearch}
        isSearchDrawerOpen={isSearchDrawerOpen}
        onCloseSearchDrawer={handleCloseSearchDrawer}
        searchResults={searchResults}
        isSearchLoading={isSearchLoading}
        searchError={searchError}
        isCommentaryDrawerOpen={isCommentaryDrawerOpen}
        onCommentaryDrawerOpen={handleOpenCommentaryDrawer}
        onCommentaryDrawerClose={handleCloseCommentaryDrawer}
        onFindRelated={handleSearch}
      />
    </Box>
  );
} 