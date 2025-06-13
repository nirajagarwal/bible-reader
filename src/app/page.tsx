'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import { Verse, ReadingState, SearchResult } from '@/types/bible';
import localforage from 'localforage';
import { getChapterCount, fetchBibleStructure } from '@/lib/bibleData';

export default function Home() {
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

  // Load bible structure and initial state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load bible structure
        const structure = await fetchBibleStructure();
        setBibleStructure(structure);
        
        // Load saved reading state
        const savedState = await localforage.getItem<ReadingState>('readingState');
        if (savedState) {
          setCurrentBook(savedState.book);
          setCurrentChapter(savedState.chapter);
        } else {
          // If no saved state, ensure we're at Genesis 1
          setCurrentBook('Genesis');
          setCurrentChapter(1);
          // Save this as initial state
          await localforage.setItem('readingState', {
            book: 'Genesis',
            chapter: 1,
            scrollPosition: 0,
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Set default state on error
        setCurrentBook('Genesis');
        setCurrentChapter(1);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

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
    if (!bibleStructure) return;

    const chapters = getChapterCount(bibleStructure, currentBook);
    setTotalChapters(chapters);
    setHasNextChapter(currentChapter < chapters);
    setHasPrevChapter(currentChapter > 1);
  }, [currentBook, currentChapter, bibleStructure]);

  const handleBookSelect = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
    setHighlightedVerse(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setCurrentChapter(chapter);
    setHighlightedVerse(null);
  };

  const handleChapterChange = (direction: 'next' | 'prev') => {
    setCurrentChapter(prev => direction === 'next' ? prev + 1 : prev - 1);
    setHighlightedVerse(null);
  };

  const handleVerseSelectFromSearch = (book: string, chapter: number, verse: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setHighlightedVerse(verse);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setIsSearchDrawerOpen(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
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
      {!navsHidden && (
        <Navigation
          currentBook={currentBook}
          currentChapter={currentChapter}
          onBookSelect={handleBookSelect}
          onChapterSelect={handleChapterSelect}
          onSearch={handleSearch}
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