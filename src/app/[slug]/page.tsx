'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import { Verse, ReadingState, SearchResult } from '@/types/bible';
import localforage from 'localforage';
import { getChapterCount, fetchBibleStructure, getBookList } from '@/lib/bibleData';
import { useState, useEffect, useMemo } from 'react';
import { useSearch } from '@/context/SearchContext';

function BiblePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [currentBook, setCurrentBook] = useState('Genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [hasNextChapter, setHasNextChapter] = useState(false);
  const [hasPrevChapter, setHasPrevChapter] = useState(false);
  const [bibleStructure, setBibleStructure] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [totalChapters, setTotalChapters] = useState(1);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCommentaryDrawerOpen, setIsCommentaryDrawerOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const [isLoading, setIsLoading] = useState(true);

  // Load bible structure once
  useEffect(() => {
    const loadStructure = async () => {
      try {
        const structure = await fetchBibleStructure();
        setBibleStructure(structure);
      } catch (error) {
        console.error('Error loading bible structure:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStructure();
  }, []);

  const { otBooks, ntBooks } = useMemo(() => {
    if (!bibleStructure) return { otBooks: [], ntBooks: [] };
    const books = getBookList(bibleStructure);
    return {
      otBooks: books.slice(0, 39),
      ntBooks: books.slice(39),
    };
  }, [bibleStructure]);

  // Set view state based on URL slug
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

    if (foundBook) {
      const chapterCount = getChapterCount(bibleStructure, foundBook);
      if (chapter && chapter > 0 && chapter <= chapterCount) {
        setCurrentBook(foundBook);
        setCurrentChapter(chapter);
        setHighlightedVerse(verse);
      }
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [slug, bibleStructure, isInitialized]);

  useEffect(() => {
    // Save reading state only after initialization
    if (isInitialized) {
      const saveState = async () => {
        await localforage.setItem('readingState', {
          book: currentBook,
          chapter: currentChapter,
          scrollPosition: 0,
        });
      };
      saveState();
    }
  }, [currentBook, currentChapter, isInitialized]);

  useEffect(() => {
    // Load verses for current book and chapter
    const loadVerses = async () => {
      if (!currentBook) return;
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
  }, [currentBook, currentChapter]);

  // Update chapter navigation state whenever book, chapter, or bible structure changes
  useEffect(() => {
    if (!bibleStructure || !currentBook) return;

    const chapters = getChapterCount(bibleStructure, currentBook);
    setTotalChapters(chapters);
    setHasNextChapter(currentChapter < chapters);
    setHasPrevChapter(currentChapter > 1);
  }, [currentBook, currentChapter, bibleStructure]);

  const handleBookSelect = (book: string) => {
    const newSlug = `${book.replace(/ /g, '-').toLowerCase()}-1`;
    router.push(`/${newSlug}`);
  };

  const handleChapterSelect = (chapter: number) => {
    const newSlug = `${currentBook.replace(/ /g, '-').toLowerCase()}-${chapter}`;
    router.push(`/${newSlug}`);
  };

  const handleChapterChange = (direction: 'next' | 'prev') => {
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
        currentChapter={currentChapter}
        onChapterSelect={handleChapterSelect}
        totalChapters={totalChapters}
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

export default function SlugPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BiblePage params={params} />
    </Suspense>
  );
} 