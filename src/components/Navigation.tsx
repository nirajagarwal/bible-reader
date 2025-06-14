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
import { fetchBibleStructure, getBookList, getChapterCount, BibleStructure } from '@/lib/bibleData';

interface NavigationProps {
  currentBook: string;
  onBookSelect: (book: string) => void;
  onSearch: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function Navigation({ 
  currentBook, 
  onBookSelect, 
  onSearch,
  searchQuery,
  onSearchQueryChange,
}: NavigationProps) {
  const [bible, setBible] = useState<BibleStructure | null>(null);
  const [otBooks, setOtBooks] = useState<string[]>([]);
  const [ntBooks, setNtBooks] = useState<string[]>([]);
  const [bookAnchorEl, setBookAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    if (searchVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 100); // Delay to allow for CSS transition
    }
  }, [searchVisible]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (isMobile) {
          setSearchVisible(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch();
    if (isMobile) {
      setSearchVisible(false);
    }
  };

  const handleBookClick = (event: React.MouseEvent<HTMLElement>) => {
    setBookAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setBookAnchorEl(null);
  };

  const handleBookSelect = (book: string) => {
    onBookSelect(book);
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

  return (
    <AppBar 
      position="sticky" 
      color="default" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        '& .MuiToolbar-root': { minHeight: '48px', padding: '0 16px' },
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar disableGutters sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: '1 1 auto',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <Button color="primary" onClick={handleBookClick} sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
            {currentBook}
          </Button>
        </Box>
        
        <Box 
          ref={searchContainerRef}
          sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <Collapse in={searchVisible || !isMobile} orientation="horizontal" timeout={300}>
            <Paper
              component="form"
              elevation={0}
              variant="outlined"
              onSubmit={handleSearchSubmit}
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center', 
                width: isMobile ? '100%' : '280px',
                maxWidth: '400px',
                borderRadius: '8px',
                height: 38,
                transition: 'width 0.3s',
                '&:focus-within': {
                  width: isMobile ? '100%' : '320px',
                }
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search Bible..."
              />
              <IconButton 
                type="submit" 
                sx={{ p: '8px' }} 
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>
              {isMobile && (
                <IconButton 
                  onClick={() => {
                    onSearchQueryChange('');
                    setSearchVisible(false);
                  }} 
                  sx={{ p: '8px' }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Paper>
          </Collapse>
          {isMobile && !searchVisible && (
            <IconButton onClick={() => setSearchVisible(true)} sx={{ p: '8px' }}>
              <SearchIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      {renderBookMenu(bookAnchorEl)}
    </AppBar>
  );
} 