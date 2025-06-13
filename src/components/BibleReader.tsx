import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Drawer,
  Menu,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ReactMarkdown from 'react-markdown';
import { Verse, Commentary, SearchResult } from '@/types/bible';
import ScaleLoader from 'react-spinners/ScaleLoader';

interface BibleReaderProps {
  verses: Verse[];
  onChapterChange: (direction: 'next' | 'prev') => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
  highlightedVerse: number | null;
  currentChapter: number;
  onChapterSelect: (chapter: number) => void;
  totalChapters: number;
  onVerseSelectFromSearch: (book: string, chapter: number, verse: number) => void;
  isSearchDrawerOpen: boolean;
  onCloseSearchDrawer: () => void;
  searchResults: SearchResult[];
  isSearchLoading: boolean;
  searchError: string | null;
  isCommentaryDrawerOpen: boolean;
  onCommentaryDrawerOpen: () => void;
  onCommentaryDrawerClose: () => void;
}

export default function BibleReader({ 
  verses, 
  onChapterChange,
  hasNextChapter,
  hasPrevChapter,
  highlightedVerse,
  currentChapter,
  onChapterSelect,
  totalChapters,
  onVerseSelectFromSearch,
  isSearchDrawerOpen,
  onCloseSearchDrawer,
  searchResults,
  isSearchLoading,
  searchError,
  isCommentaryDrawerOpen,
  onCommentaryDrawerOpen,
  onCommentaryDrawerClose,
}: BibleReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loading, setLoading] = useState(false);
  const [chapterAnchorEl, setChapterAnchorEl] = useState<null | HTMLElement>(null);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't navigate if a modal/drawer is open or if typing in an input
      if (isCommentaryDrawerOpen || isSearchDrawerOpen || (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        return;
      }

      if (event.key === 'ArrowRight' && hasNextChapter) {
        onChapterChange('next');
      } else if (event.key === 'ArrowLeft' && hasPrevChapter) {
        onChapterChange('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChapterChange, hasNextChapter, hasPrevChapter, isCommentaryDrawerOpen, isSearchDrawerOpen]);

  const handleVerseClick = async (verse: Verse) => {
    setSelectedVerse(verse);
    setCommentary(null);
    onCommentaryDrawerOpen();
    setLoading(true);

    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text 
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch commentary');

      const data = await response.json();
      
      // The API now directly returns the commentary text.
      // We'll create a Commentary object on the client side.
      const newCommentary: Commentary = {
        verse: verse.text,
        text: data.commentary,
        timestamp: Date.now(), // Still useful for display logic if needed
      };

      setCommentary(newCommentary);
    } catch (error) {
      console.error('Error fetching commentary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCommentary = () => {
    onCommentaryDrawerClose();
    setSelectedVerse(null);
    setCommentary(null);
  };

  const handleChapterClick = (event: React.MouseEvent<HTMLElement>) => {
    setChapterAnchorEl(event.currentTarget);
  };

  const handleChapterClose = () => {
    setChapterAnchorEl(null);
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    handleChapterClose();
  };

  const handleSearchResultClick = (result: SearchResult) => {
    onVerseSelectFromSearch(result.book, result.chapter, result.verse);
    onCloseSearchDrawer();
  };

  const handleCopySearchResults = () => {
    const textToCopy = searchResults.map(r => `${r.book} ${r.chapter}:${r.verse} - ${r.text}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
  };

  const renderChapterMenu = (anchorEl: HTMLElement | null) => {
    if (!verses.length) return null;
    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleChapterClose}
        PaperProps={{
          style: { maxHeight: '80vh', width: 'auto', minWidth: 300 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '70vh', overflow: 'auto' }}>
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant="outlined"
              size="small"
              onClick={() => handleChapterSelect(chapter)}
              sx={{ minWidth: 40, height: 40, borderRadius: '50%', p: 0 }}
            >
              {chapter}
            </Button>
          ))}
        </Box>
      </Menu>
    );
  };

  const navsHidden = isSearchDrawerOpen || isCommentaryDrawerOpen;

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
          height: navsHidden ? '100vh' : 'calc(100vh - 56px)',
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

      {!navsHidden && (
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.paper',
          height: '56px',
          boxSizing: 'border-box',
          position: 'sticky',
          bottom: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
          <Button
            color="primary"
            onClick={handleChapterClick}
          >
            {`CHAPTER ${currentChapter}`}
          </Button>
          {renderChapterMenu(chapterAnchorEl)}
          
          <Box>
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
              Next
            </Button>
          </Box>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={isCommentaryDrawerOpen}
        onClose={handleCloseCommentary}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480 },
            boxSizing: 'border-box',
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

      <Drawer
        anchor="right"
        open={isSearchDrawerOpen}
        onClose={onCloseSearchDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" component="div">
            Search Results
          </Typography>
          <Box>
            {searchResults.length > 0 && (
              <IconButton color="inherit" onClick={handleCopySearchResults}>
                <ContentCopyIcon />
              </IconButton>
            )}
            <IconButton color="inherit" onClick={onCloseSearchDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isSearchLoading && <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><ScaleLoader color={theme.palette.text.secondary} /></Box>}
          {searchError && <Typography color="error" sx={{p: 2}}>{searchError}</Typography>}
          {!isSearchLoading && !searchError && searchResults.length === 0 && (
            <Typography color="text.secondary" sx={{p: 2}}>No results found.</Typography>
          )}
          {!isSearchLoading && !searchError && searchResults.length > 0 && (
            <List>
              {searchResults.map((result) => (
                <ListItem
                  button
                  key={`${result.book}-${result.chapter}-${result.verse}`}
                  onClick={() => handleSearchResultClick(result)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemText
                    secondary={`${result.book} ${result.chapter}:${result.verse}`}
                    primary={result.text}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
} 