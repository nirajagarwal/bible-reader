import { useState, useEffect } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchBibleStructure, getBookList, getChapterCount, BibleStructure } from '@/lib/bibleData';

interface NavigationProps {
  currentBook: string;
  currentChapter: number;
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
  onSearch: (query: string) => void;
}

export default function Navigation({ 
  currentBook, 
  currentChapter, 
  onBookSelect, 
  onChapterSelect,
  onSearch,
}: NavigationProps) {
  const [bible, setBible] = useState<BibleStructure | null>(null);
  const [otBooks, setOtBooks] = useState<string[]>([]);
  const [ntBooks, setNtBooks] = useState<string[]>([]);
  const [bookAnchorEl, setBookAnchorEl] = useState<null | HTMLElement>(null);
  const [chapterAnchorEl, setChapterAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBibleStructure().then((data) => {
      setBible(data);
      const books = getBookList(data);
      const ot = books.slice(0, 39);
      const nt = books.slice(39);
      setOtBooks(ot);
      setNtBooks(nt);
      // Set initial tab based on current book
      if (ntBooks.includes(currentBook)) {
        setTabValue(1);
      }
    });
  }, [currentBook]); // Rerun if currentBook changes, for initial load

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchQuery);
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
                  width: '100%'
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
    if (!bible || !currentBook) return null;
    const chapters = getChapterCount(bible, currentBook);
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
          {Array.from({ length: chapters }, (_, i) => i + 1).map((chapter) => (
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

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={1}
      sx={{ 
        '& .MuiToolbar-root': { minHeight: '48px', padding: '0 16px' },
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Button color="primary" onClick={handleBookClick}>
            {currentBook}
          </Button>
          {renderBookMenu(bookAnchorEl)}
        </Box>
        
        <Box sx={{ 
          position: 'relative',
          width: { xs: '280px', sm: '320px', md: '480px' }
        }}>
          <Paper
            component="form"
            variant="outlined"
            onSubmit={handleSearchSubmit}
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              borderRadius: '8px',
              height: 38,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Bible..."
            />
            <IconButton 
              type="submit" 
              sx={{ 
                p: '8px',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }} 
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 