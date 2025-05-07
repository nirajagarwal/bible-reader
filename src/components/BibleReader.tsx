import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import { Verse, Commentary } from '@/types/bible';
import localforage from 'localforage';

interface BibleReaderProps {
  verses: Verse[];
  onChapterEnd: () => void;
}

export default function BibleReader({ verses, onChapterEnd }: BibleReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 50) {
        onChapterEnd();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onChapterEnd]);

  const handleVerseClick = async (verse: Verse) => {
    setSelectedVerse(verse);
    setCommentary(null);
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
    setSelectedVerse(null);
    setCommentary(null);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '& > *': { mb: 2 },
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
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ mr: 1 }}
            >
              {verse.verse}.
            </Typography>
            {verse.text}
          </Typography>
        ))}
      </Box>

      <Dialog
        open={Boolean(selectedVerse)}
        onClose={handleCloseCommentary}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <IconButton
            onClick={handleCloseCommentary}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedVerse && (
            <Box sx={{ mt: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : commentary ? (
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default',
                    boxShadow: 'none',
                    border: 'none'
                  }}
                >
                  <ReactMarkdown>{commentary.text}</ReactMarkdown>
                </Paper>
              ) : null}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 