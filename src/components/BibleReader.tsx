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
  MenuItem,
  Tabs,
  Tab,
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
  onVerseSelectFromSearch: (book: string, chapter: number, verse: number) => void;
  isSearchDrawerOpen: boolean;
  onCloseSearchDrawer: () => void;
  oldTestamentResults: SearchResult[];
  newTestamentResults: SearchResult[];
  isSearchLoading: boolean;
  searchError: string | null;
  isCommentaryDrawerOpen: boolean;
  onCommentaryDrawerOpen: () => void;
  onCommentaryDrawerClose: () => void;
  onFindRelated: (query: string) => void;
  activeTab: 'NT' | 'OT';
  onTabChange: (tab: 'NT' | 'OT') => void;
}

export default function BibleReader({ 
  verses, 
  onChapterChange,
  hasNextChapter,
  hasPrevChapter,
  highlightedVerse,
  onVerseSelectFromSearch,
  isSearchDrawerOpen,
  onCloseSearchDrawer,
  oldTestamentResults,
  newTestamentResults,
  isSearchLoading,
  searchError,
  isCommentaryDrawerOpen,
  onCommentaryDrawerOpen,
  onCommentaryDrawerClose,
  onFindRelated,
  activeTab,
  onTabChange,
}: BibleReaderProps) {
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [commentary, setCommentary] = useState<Commentary | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] =
    useState<{
      mouseX: number;
      mouseY: number;
    } | null>(null);
  const highlightedVerseRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (highlightedVerse && highlightedVerseRef.current) {
      highlightedVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (contentRef.current) {
      contentRef.current.scrollTop = 0;
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

  const handleVerseClick = (event: React.MouseEvent, verse: Verse) => {
    event.preventDefault();
    setSelectedVerse(verse);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleCloseVerseMenu = () => {
    setContextMenu(null);
  };

  const handleCommentaryClick = async () => {
    if (!selectedVerse) return;

    handleCloseVerseMenu();
    setCommentary(null);
    setCommentaryError(null);
    onCommentaryDrawerOpen();
    setLoading(true);

    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          book: selectedVerse.book,
          chapter: selectedVerse.chapter,
          verse: selectedVerse.verse,
          text: selectedVerse.text 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch commentary');
      }
      
      const newCommentary: Commentary = {
        verse: selectedVerse.text,
        text: data.commentary,
        timestamp: Date.now(),
      };

      setCommentary(newCommentary);
    } catch (error) {
      if (error instanceof Error) {
        setCommentaryError(error.message);
      } else {
        setCommentaryError('An unknown error occurred.');
      }
      console.error('Error fetching commentary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelatedClick = () => {
    if (selectedVerse) {
      onFindRelated(selectedVerse.text);
    }
    handleCloseVerseMenu();
  };

  const handleCloseCommentary = () => {
    onCommentaryDrawerClose();
    setSelectedVerse(null);
    setCommentary(null);
    setCommentaryError(null);
  };

  const handleFindRelated = () => {
    if (selectedVerse) {
      onFindRelated(selectedVerse.text);
      handleCloseCommentary();
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    onVerseSelectFromSearch(result.book, result.chapter, result.verse);
    onCloseSearchDrawer();
  };

  const handleCopySearchResults = () => {
    const allResults = [...newTestamentResults, ...oldTestamentResults];
    const textToCopy = allResults.map(r => `${r.book} ${r.chapter}:${r.verse} - ${r.text}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue === 0 ? 'NT' : 'OT');
  };

  const getCurrentResults = () => {
    return activeTab === 'NT' ? newTestamentResults : oldTestamentResults;
  };

  const getTotalResultsCount = () => {
    return oldTestamentResults.length + newTestamentResults.length;
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
        ref={contentRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 0,
          '& > *': { mb: 2 },
        }}
      >
        {verses && verses.map((verse) => (
          <Typography
            ref={verse.verse === highlightedVerse ? highlightedVerseRef : null}
            key={`${verse.chapter}-${verse.verse}`}
            variant="body1"
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              px: 2, py: 0.5,
              borderRadius: 0,
              fontWeight: verse.verse === highlightedVerse ? 'bold' : 'normal',
              border: `1px solid ${verse.verse === highlightedVerse ? 'orange' : 'transparent'}`,
            }}
            onClick={(event) => handleVerseClick(event, verse)}
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

      <Drawer
        anchor="right"
        open={isCommentaryDrawerOpen}
        onClose={handleCloseCommentary}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480 },
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" component="div">
            {loading ? 'Generating...' : 'Commentary'}
          </Typography>
          <Box>
            <IconButton onClick={handleCloseCommentary}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, p:2, pt:0, overflowY: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <ScaleLoader color={theme.palette.text.secondary} />
            </Box>
          )}
          {!loading && commentaryError && (
            <Typography color="error" sx={{p: 2, textAlign: 'center'}}>
              {commentaryError}
            </Typography>
          )}
          {!loading && !commentaryError && commentary && <ReactMarkdown>{commentary.text}</ReactMarkdown>}
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
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
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
            {getTotalResultsCount() > 0 && (
              <IconButton color="inherit" onClick={handleCopySearchResults}>
                <ContentCopyIcon />
              </IconButton>
            )}
            <IconButton color="inherit" onClick={onCloseSearchDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Tabs for Old/New Testament */}
        {!isSearchLoading && !searchError && getTotalResultsCount() > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
            <Tabs 
              value={activeTab === 'NT' ? 0 : 1} 
              onChange={handleTabChange}
              sx={{ minHeight: 48 }}
            >
              <Tab 
                label="New Testament"
                sx={{ minHeight: 48, textTransform: 'none' }}
              />
              <Tab 
                label="Old Testament"
                sx={{ minHeight: 48, textTransform: 'none' }}
              />
            </Tabs>
          </Box>
        )}
        
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isSearchLoading && <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><ScaleLoader color={theme.palette.text.secondary} /></Box>}
          {searchError && <Typography color="error" sx={{px: 2}}>{searchError}</Typography>}
          {!isSearchLoading && !searchError && getTotalResultsCount() === 0 && (
            <Typography color="text.secondary" sx={{px: 2, py:1}}>No results found.</Typography>
          )}
          {!isSearchLoading && !searchError && getCurrentResults().length > 0 && (
            <List sx={{p: 0}}>
              {getCurrentResults().map((result) => (
                <ListItem
                  button
                  key={`${result.book}-${result.chapter}-${result.verse}`}
                  onClick={() => handleSearchResultClick(result)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 2,
                    py: 0,
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
          {!isSearchLoading && !searchError && getCurrentResults().length === 0 && getTotalResultsCount() > 0 && (
            <Typography color="text.secondary" sx={{px: 2, py: 2, textAlign: 'center'}}>
              No results in {activeTab === 'NT' ? 'New Testament' : 'Old Testament'}
            </Typography>
          )}
        </Box>
      </Drawer>

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseVerseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <MenuItem onClick={handleCommentaryClick}>Commentary</MenuItem>
        <MenuItem onClick={handleRelatedClick}>Related Verses</MenuItem>
      </Menu>
    </Box>
  );
} 