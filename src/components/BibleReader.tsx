import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Drawer,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ReactMarkdown from 'react-markdown';
import { Verse, Commentary } from '@/types/bible';
import localforage from 'localforage';
import ScaleLoader from 'react-spinners/ScaleLoader';

interface BibleReaderProps {
  verses: Verse[];
  onChapterChange: (direction: 'next' | 'prev') => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
  highlightedVerse: number | null;
}

export default function BibleReader({ 
  verses, 
  onChapterChange,
  hasNextChapter,
  hasPrevChapter,
  highlightedVerse
}: BibleReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const highlightedVerseRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (highlightedVerse && highlightedVerseRef.current) {
      highlightedVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedVerse, verses]); // Rerun when verses load for the new chapter

  const handleVerseClick = async (verse: Verse) => {
    setSelectedVerse(verse);
    setCommentary(null);
    setIsCommentaryOpen(true);
    const verseKey = `${verse.book}-${verse.chapter}-${verse.verse}`;
    
    // Check if commentary exists in local storage
    const cachedCommentary = await localforage.getItem<Commentary>(verseKey);
    if (cachedCommentary) {
      // Verify that the cached commentary matches the current verse
      if (cachedCommentary.verse === verse.text) {
        setCommentary(cachedCommentary);
        return;
      } else {
        // If verse text doesn't match, clear the cache for this verse
        await localforage.removeItem(verseKey);
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verse: verse.text }),
      });

      if (!response.ok) throw new Error('Failed to fetch commentary');

      const data = await response.json();
      const newCommentary: Commentary = {
        verse: verse.text,
        text: data.commentary,
        timestamp: Date.now(),
      };

      // Cache the commentary
      await localforage.setItem(verseKey, newCommentary);
      setCommentary(newCommentary);
    } catch (error) {
      console.error('Error fetching commentary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCommentary = () => {
    setIsCommentaryOpen(false);
    setSelectedVerse(null);
    setCommentary(null);
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Prevent body scroll
    }}>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '& > *': { mb: 2 },
          height: 'calc(100vh - 40px)', // Updated to match new nav height
        }}
      >
        {verses.map((verse) => (
          <Typography
            ref={verse.verse === highlightedVerse ? highlightedVerseRef : null}
            key={`${verse.chapter}-${verse.verse}`}
            variant="body1"
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              p: 1,
              borderRadius: 1,
              fontWeight: verse.verse === highlightedVerse ? 'bold' : 'normal',
            }}
            onClick={() => handleVerseClick(verse)}
          >
            <Typography
              component="sup"
              variant="caption"
              color="text.secondary"
              sx={{ 
                mr: 0.5,
                fontSize: '0.75rem',
                verticalAlign: 'super',
                lineHeight: 0
              }}
            >
              {verse.verse}
            </Typography>
            {verse.text}
          </Typography>
        ))}
      </Box>

      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        bgcolor: 'background.paper',
        height: '40px',
        boxSizing: 'border-box'
      }}>
        <Button
          startIcon={<NavigateBeforeIcon />}
          onClick={() => onChapterChange('prev')}
          disabled={!hasPrevChapter}
        >
          PREVIOUS
        </Button>
        <Button
          endIcon={<NavigateNextIcon />}
          onClick={() => onChapterChange('next')}
          disabled={!hasNextChapter}
        >
          Next Chapter
        </Button>
      </Box>

      <Drawer
        anchor="right"
        open={isCommentaryOpen}
        onClose={handleCloseCommentary}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            boxSizing: 'border-box',
            position: 'relative',
          },
        }}
      >
        <Button
          onClick={handleCloseCommentary}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 'auto',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            },
            zIndex: 1300,
          }}
        >×
        </Button>
        
        <Box sx={{ height: '100%', p: 3, pt: 0, overflowY: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <ScaleLoader color={theme.palette.text.secondary} />
            </Box>
          )}
          {!loading && commentary && <ReactMarkdown>{commentary.text}</ReactMarkdown>}
        </Box>
      </Drawer>
    </Box>
  );
} 