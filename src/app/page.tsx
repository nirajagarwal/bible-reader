'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import { Verse, ReadingState } from '@/types/bible';
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

    const totalChapters = getChapterCount(bibleStructure, currentBook);
    console.log('Navigation update:', {
      currentBook,
      currentChapter,
      totalChapters,
      hasNext: currentChapter < totalChapters,
      hasPrev: currentChapter > 1
    });

    setHasNextChapter(currentChapter < totalChapters);
    setHasPrevChapter(currentChapter > 1);
  }, [currentBook, currentChapter, bibleStructure]);

  const handleBookSelect = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
  };

  const handleChapterSelect = (chapter: number) => {
    setCurrentChapter(chapter);
  };

  const handleChapterChange = (direction: 'next' | 'prev') => {
    setCurrentChapter(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation
        currentBook={currentBook}
        currentChapter={currentChapter}
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
      />
      <BibleReader 
        verses={verses} 
        onChapterChange={handleChapterChange}
        hasNextChapter={hasNextChapter}
        hasPrevChapter={hasPrevChapter}
      />
    </Box>
  );
} 