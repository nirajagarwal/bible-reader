'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Navigation from '@/components/Navigation';
import BibleReader from '@/components/BibleReader';
import { Verse, ReadingState } from '@/types/bible';
import localforage from 'localforage';

export default function Home() {
  const [currentBook, setCurrentBook] = useState('genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);

  useEffect(() => {
    // Load saved reading state
    const loadSavedState = async () => {
      const savedState = await localforage.getItem<ReadingState>('readingState');
      if (savedState) {
        setCurrentBook(savedState.book);
        setCurrentChapter(savedState.chapter);
      }
    };
    loadSavedState();
  }, []);

  useEffect(() => {
    // Save reading state
    const saveState = async () => {
      await localforage.setItem('readingState', {
        book: currentBook,
        chapter: currentChapter,
        scrollPosition: 0,
      });
    };
    saveState();
  }, [currentBook, currentChapter]);

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

  const handleBookSelect = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
  };

  const handleChapterSelect = (chapter: number) => {
    setCurrentChapter(chapter);
  };

  const handleChapterEnd = () => {
    setCurrentChapter((prev) => prev + 1);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation
        currentBook={currentBook}
        currentChapter={currentChapter}
        onBookSelect={handleBookSelect}
        onChapterSelect={handleChapterSelect}
      />
      <BibleReader verses={verses} onChapterEnd={handleChapterEnd} />
    </Box>
  );
} 