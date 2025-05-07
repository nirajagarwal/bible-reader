import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Drawer,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ReactMarkdown from 'react-markdown';
import { Verse, Commentary } from '@/types/bible';
import localforage from 'localforage';

interface BibleReaderProps {
  verses: Verse[];
  onChapterChange: (direction: 'next' | 'prev') => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
}

export default function BibleReader({ 
  verses, 
  onChapterChange,
  hasNextChapter,
  hasPrevChapter 
}: BibleReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);

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
            key={`${verse.chapter}-${verse.verse}`}
            variant="body1"
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              p: 1,
              borderRadius: 1,
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
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        height: '40px', // Updated to match new nav height
        boxSizing: 'border-box'
      }}>
        <Button
          startIcon={<NavigateBeforeIcon />}
          onClick={() => onChapterChange('prev')}
          disabled={!hasPrevChapter}
        >
          Previous Chapter
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
          },
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            p: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <IconButton onClick={handleCloseCommentary} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {selectedVerse && (
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              p: 1.5
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : commentary ? (
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'background.default',
                    boxShadow: 'none',
                    border: 'none',
                    '& p': {
                      fontSize: '0.8125rem',
                      mb: 0.75,
                      lineHeight: 1.5
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      fontSize: '0.9375rem',
                      mb: 0.75,
                      mt: 1.0,
                      fontWeight: 600
                    },
                    '& ul, & ol': {
                      pl: 2,
                      mb: 0.75,
                      fontSize: '0.8125rem'
                    }
                  }}
                >
                  <ReactMarkdown>{commentary.text}</ReactMarkdown>
                </Paper>
              ) : null}
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
} 