import { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  InputBase,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { fetchBibleStructure, getBookList, getChapterCount, BibleStructure } from '@/lib/bibleData';

interface NavigationProps {
  currentBook: string | null;
  onBookSelect: (book: string) => void;
  onSearch: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onChapterChange: (direction: 'next' | 'prev') => void;
  hasNextChapter: boolean;
  hasPrevChapter: boolean;
  currentChapter: number | null;
  onChapterSelect: (chapter: number) => void;
  totalChapters: number;
  otBooks: string[];
  ntBooks: string[];
}

export default function Navigation({ 
  currentBook, 
  onBookSelect, 
  onSearch,
  searchQuery,
  onSearchQueryChange,
  onChapterChange,
  hasNextChapter,
  hasPrevChapter,
  currentChapter,
  onChapterSelect,
  totalChapters,
  otBooks,
  ntBooks
}: NavigationProps) {
  const [bookAnchorEl, setBookAnchorEl] = useState<null | HTMLElement>(null);
  const [chapterAnchorEl, setChapterAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Set initial tab based on current book
    if (currentBook && ntBooks.includes(currentBook)) {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [currentBook, ntBooks]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  const handleBookClick = (event: React.MouseEvent<HTMLElement>) => {
    setBookAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (event: React.MouseEvent<HTMLElement>) => {
    setChapterAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setBookAnchorEl(null);
    setChapterAnchorEl(null);
  };

  const handleBookSelect = (book: string) => {
    onBookSelect(book);
    handleClose();
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    handleClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderBookList = (books: string[]) => (
    <Grid container spacing={0} sx={{ p: 0 }}>
      {Array.from({ length: 3 }).map((_, colIndex) => (
        <Grid item xs={4} key={colIndex} sx={{p:0}}>
          {books.slice(colIndex * 13, (colIndex + 1) * 13).map((book) => (
            <MenuItem
              key={book}
              onClick={() => handleBookSelect(book)}
              selected={currentBook === book}
              sx={{ 
                justifyContent: 'flex-start',
                fontSize: '1rem',
                minHeight: 'unset',
                lineHeight: 1.5,
                maxWidth: '100%',
                '& .MuiMenuItem-root': {
                  paddingTop: 1,
                  paddingBottom:1,
                  marginTop: 0,
                  marginBottom: 0
                }
              }}
            >
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {book}
              </Typography>
            </MenuItem>
          ))}
        </Grid>
      ))}
    </Grid>
  );

  const renderBookMenu = (anchorEl: HTMLElement | null) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '90%', sm: 600 }, maxWidth: 600 } }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="testament tabs" variant="fullWidth">
          <Tab label="Old Testament" />
          <Tab label="New Testament" />
        </Tabs>
      </Box>
      {tabValue === 0 && renderBookList(otBooks)}
      {tabValue === 1 && renderBookList(ntBooks)}
    </Menu>
  );

  const renderChapterMenu = (anchorEl: HTMLElement | null) => {
    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: '80vh', width: 'auto', minWidth: 300 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '70vh', overflow: 'auto' }}>
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant="contained"
              size="small"
              onClick={() => handleChapterSelect(chapter)}
              sx={{ minWidth: 40, height: 40, p: 0 }}
            >
              {chapter}
            </Button>
          ))}
        </Box>
      </Menu>
    );
  };

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        '& .MuiToolbar-root': { minHeight: '48px' },
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', alignItems: 'center', px: { xs: 0.5, sm: 2 } }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: '1 0 auto',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {currentBook && (
            <>
              <Button 
                variant="contained"
                onClick={handleBookClick} 
                sx={{ 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap', 
                  minWidth: 0, 
                  display: 'block',
                  maxWidth: { xs: '120px', sm: '200px' }
                }}
              >
                {currentBook}
              </Button>
              <Button 
                variant="contained"
                onClick={handleChapterClick}
                sx={{
                  minWidth: 36,
                  height: 36,
                  p: 0,
                  ml: { xs: 0.5, sm: 1 }
                }}
              >
                {currentChapter}
              </Button>
            </>
          )}
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '1 1 100%',
            mx: { xs: 0.5, sm: 1 },
          }}
        >
          <Paper
            component="form"
            elevation={0}
            variant="outlined"
            onSubmit={handleSearchSubmit}
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              height: 38,
            }}
          >
            <IconButton 
              type="submit" 
              sx={{ p: { xs: '2px', sm: '4px' } }} 
              aria-label="search"
            >
              <SearchIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            </IconButton>
            <InputBase
              sx={{ ml: { xs: 0.5, sm: 1 }, flex: 1 }}
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: '1 0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained"
            onClick={() => onChapterChange('prev')} 
            disabled={!hasPrevChapter}
            sx={{ minWidth: 36, height: 36, p: 0 }}
          >
            <NavigateBeforeIcon />
          </Button>
          <Button 
            variant="contained"
            onClick={() => onChapterChange('next')} 
            disabled={!hasNextChapter}
            sx={{ minWidth: 36, height: 36, p: 0, ml: { xs: 0.5, sm: 1 } }}
          >
            <NavigateNextIcon />
          </Button>
        </Box>
      </Toolbar>
      {renderBookMenu(bookAnchorEl)}
      {renderChapterMenu(chapterAnchorEl)}
    </AppBar>
  );
} 