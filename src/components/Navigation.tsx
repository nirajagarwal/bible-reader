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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { alpha } from '@mui/material/styles';

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

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

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
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: '70vh', overflow: 'auto' }}>
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant={chapter === currentChapter ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleChapterSelect(chapter)}
              sx={{
                minWidth: 40,
                height: 40,
                p: 0,
                fontFamily: 'var(--font-serif), serif',
                fontWeight: 600,
              }}
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
            aria-haspopup="true"
            aria-expanded={Boolean(bookAnchorEl)}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              fontFamily: 'var(--font-serif), serif',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.01em',
              minWidth: 0,
              maxWidth: { xs: '150px', sm: '240px' },
              pl: { xs: 1.25, sm: 2 },
              pr: { xs: 0.75, sm: 1.25 },
              '& .MuiButton-endIcon': {
                ml: 0.25,
                mr: -0.25,
                '& > svg': { fontSize: '1.25rem' },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {currentBook}
            </Box>
          </Button>
          <Button
            variant="outlined"
            onClick={handleChapterClick}
            aria-haspopup="true"
            aria-expanded={Boolean(chapterAnchorEl)}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              minWidth: 56,
              height: 36,
              ml: { xs: 0.5, sm: 1 },
              pl: 1,
              pr: 0.5,
              fontFamily: 'var(--font-serif), serif',
              fontWeight: 600,
              '& .MuiButton-endIcon': {
                ml: 0.25,
                mr: -0.25,
                '& > svg': { fontSize: '1.25rem' },
              },
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
            sx={(theme) => ({
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '420px',
              borderRadius: '999px',
              height: 38,
              borderColor: theme.palette.divider,
              backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.06 : 0.05),
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
              '&:focus-within': {
                borderColor: theme.palette.secondary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.18)}`,
              },
            })}
          >
            <IconButton
              type="submit"
              sx={{ p: { xs: '2px', sm: '4px' } }}
              aria-label="search"
            >
              <SearchIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.35rem' } }} />
            </IconButton>
            <InputBase
              sx={(theme) => ({
                ml: { xs: 0.5, sm: 1 },
                flex: 1,
                fontFamily: 'var(--font-sans), sans-serif',
                fontSize: '0.92rem',
                color: theme.palette.text.primary,
              })}
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: '1 0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => onChapterChange('prev')}
            disabled={!hasPrevChapter}
            sx={{ minWidth: 36, height: 36, p: 0 }}
          >
            <NavigateBeforeIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            onClick={() => onChapterChange('next')}
            disabled={!hasNextChapter}
            sx={{ minWidth: 36, height: 36, p: 0, ml: { xs: 0.5, sm: 1 } }}
          >
            <NavigateNextIcon fontSize="small" />
          </Button>
        </Box>
      </Toolbar>
      {renderBookMenu(bookAnchorEl)}
      {renderChapterMenu(chapterAnchorEl)}
    </AppBar>
  );
} 