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
import { useTheme, alpha } from '@mui/material/styles';
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
          py: { xs: 3, sm: 5 },
          px: { xs: 2, sm: 4 },
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: '720px', width: '100%' }}>
          {verses && verses.map((verse) => {
            const isHighlighted = verse.verse === highlightedVerse;
            return (
              <Typography
                ref={isHighlighted ? highlightedVerseRef : null}
                key={`${verse.chapter}-${verse.verse}`}
                variant="body1"
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  px: { xs: 1.5, sm: 2 },
                  py: 0.6,
                  mb: 0.25,
                  fontSize: { xs: '1.1rem', sm: '1.18rem' },
                  lineHeight: 1.6,
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderLeftColor: isHighlighted ? 'secondary.main' : 'transparent',
                  backgroundColor: isHighlighted
                    ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.10 : 0.08)
                    : 'transparent',
                  transition: 'background-color 120ms ease, border-color 120ms ease',
                  '&:hover': {
                    backgroundColor: isHighlighted
                      ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.14 : 0.12)
                      : alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.06 : 0.05),
                  },
                }}
                onClick={(event) => handleVerseClick(event, verse)}
              >
                <Typography
                  component="sup"
                  sx={{
                    mr: 0.5,
                    fontFamily: 'var(--font-sans), sans-serif',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: 'secondary.main',
                    verticalAlign: 'super',
                    lineHeight: 0,
                  }}
                >
                  {verse.verse}
                </Typography>
                {verse.text}
              </Typography>
            );
          })}
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={isCommentaryDrawerOpen}
        onClose={handleCloseCommentary}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 520 },
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'secondary.main',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            >
              {loading ? 'Generating' : 'Commentary'}
            </Typography>
            {selectedVerse && (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'var(--font-serif), serif',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleCloseCommentary} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 3,
            py: 2,
            overflowY: 'auto',
            '& h1, & h2, & h3, & h4': {
              fontFamily: 'var(--font-serif), serif',
              color: 'primary.main',
              mt: 2.5,
              mb: 1,
              lineHeight: 1.3,
            },
            '& h1': { fontSize: '1.5rem' },
            '& h2': { fontSize: '1.25rem' },
            '& h3': { fontSize: '1.1rem' },
            '& p': {
              fontFamily: 'var(--font-serif), serif',
              fontSize: '1rem',
              lineHeight: 1.7,
              mb: 1.5,
              color: 'text.primary',
            },
            '& em': { color: 'secondary.main' },
            '& strong': { color: 'primary.main' },
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <ScaleLoader color={theme.palette.secondary.main} />
            </Box>
          )}
          {!loading && commentaryError && (
            <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
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
            width: { xs: '100%', sm: 520 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'secondary.main',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.65rem',
            }}
          >
            Search Results
            {getTotalResultsCount() > 0 && (
              <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontWeight: 400 }}>
                · {getTotalResultsCount()}
              </Box>
            )}
          </Typography>
          <Box>
            {getTotalResultsCount() > 0 && (
              <IconButton onClick={handleCopySearchResults} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={onCloseSearchDrawer} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {!isSearchLoading && !searchError && getTotalResultsCount() > 0 && (
          <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
            <Tabs
              value={activeTab === 'NT' ? 0 : 1}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ minHeight: 44 }}
            >
              <Tab label={`New Testament (${newTestamentResults.length})`} sx={{ minHeight: 44 }} />
              <Tab label={`Old Testament (${oldTestamentResults.length})`} sx={{ minHeight: 44 }} />
            </Tabs>
          </Box>
        )}

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isSearchLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <ScaleLoader color={theme.palette.secondary.main} />
            </Box>
          )}
          {searchError && <Typography color="error" sx={{ px: 3, py: 2 }}>{searchError}</Typography>}
          {!isSearchLoading && !searchError && getTotalResultsCount() === 0 && (
            <Typography color="text.secondary" sx={{ px: 3, py: 2 }}>No results found.</Typography>
          )}
          {!isSearchLoading && !searchError && getCurrentResults().length > 0 && (
            <List sx={{ p: 0 }}>
              {getCurrentResults().map((result) => (
                <ListItem
                  button
                  key={`${result.book}-${result.chapter}-${result.verse}`}
                  onClick={() => handleSearchResultClick(result)}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 2.5,
                    py: 0.75,
                    transition: 'background-color 120ms ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                    },
                  }}
                >
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-serif), serif',
                          fontSize: '0.95rem',
                          lineHeight: 1.4,
                          color: 'text.primary',
                        }}
                      >
                        {result.text}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        component="span"
                        sx={{
                          display: 'block',
                          fontFamily: 'var(--font-sans), sans-serif',
                          fontSize: '0.62rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'secondary.main',
                          mt: 0.25,
                          fontWeight: 600,
                        }}
                      >
                        {`${result.book} ${result.chapter}:${result.verse}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          {!isSearchLoading && !searchError && getCurrentResults().length === 0 && getTotalResultsCount() > 0 && (
            <Typography color="text.secondary" sx={{ px: 3, py: 2, textAlign: 'center' }}>
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