'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import localforage from 'localforage';
import { ReadingState } from '@/types/bible';
import { Box } from '@mui/material';
import { ScaleLoader } from 'react-spinners';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkLastRead = async () => {
      try {
        const savedState = await localforage.getItem<ReadingState>('readingState');
        if (savedState && savedState.book && savedState.chapter) {
          const slug = `${savedState.book.replace(/ /g, '-').toLowerCase()}-${savedState.chapter}`;
          router.replace(`/${slug}`);
        } else {
          router.replace('/genesis-1');
        }
      } catch (error) {
        console.error('Failed to retrieve reading state, redirecting to default.', error);
        router.replace('/genesis-1');
      }
    };

    checkLastRead();
  }, [router]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}
    >
      <ScaleLoader color="grey" />
    </Box>
  );
} 