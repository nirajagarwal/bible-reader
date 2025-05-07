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
} from '@mui/material';
import { fetchBibleStructure, getBookList, getChapterCount, BibleStructure } from '@/lib/bibleData';

interface NavigationProps {
  currentBook: string;
  currentChapter: number;
  onBookSelect: (book: string) => void;
  onChapterSelect: (chapter: number) => void;
}

export default function Navigation({ currentBook, currentChapter, onBookSelect, onChapterSelect }: NavigationProps) {
  const [bible, setBible] = useState<BibleStructure | null>(null);
  const [otBooks, setOtBooks] = useState<string[]>([]);
  const [ntBooks, setNtBooks] = useState<string[]>([]);
  const [otAnchorEl, setOtAnchorEl] = useState<null | HTMLElement>(null);
  const [ntAnchorEl, setNtAnchorEl] = useState<null | HTMLElement>(null);
  const [chapterAnchorEl, setChapterAnchorEl] = useState<null | HTMLElement>(null);
  const [defaultOtBook, setDefaultOtBook] = useState('Genesis');
  const [defaultNtBook, setDefaultNtBook] = useState('Matthew');

  useEffect(() => {
    fetchBibleStructure().then((data) => {
      setBible(data);
      // Simple split: OT = Genesis to Malachi, NT = Matthew to Revelation
      const books = getBookList(data);
      const ot = books.slice(0, 39);
      const nt = books.slice(39);
      setOtBooks(ot);
      setNtBooks(nt);
      setDefaultOtBook(ot[0]);
      setDefaultNtBook(nt[0]);
    });
  }, []);

  const handleOtClick = (event: React.MouseEvent<HTMLElement>) => {
    setOtAnchorEl(event.currentTarget);
  };

  const handleNtClick = (event: React.MouseEvent<HTMLElement>) => {
    setNtAnchorEl(event.currentTarget);
  };

  const handleChapterClick = (event: React.MouseEvent<HTMLElement>) => {
    setChapterAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setOtAnchorEl(null);
    setNtAnchorEl(null);
    setChapterAnchorEl(null);
  };

  const handleBookSelect = (book: string) => {
    onBookSelect(book);
    // Update default books based on selection
    if (otBooks.includes(book)) {
      setDefaultNtBook(ntBooks[0]);
    } else if (ntBooks.includes(book)) {
      setDefaultOtBook(otBooks[0]);
    }
    handleClose();
  };

  const handleChapterSelect = (chapter: number) => {
    onChapterSelect(chapter);
    handleClose();
  };

  const renderBookMenu = (books: string[], anchorEl: HTMLElement | null) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      PaperProps={{
        style: {
          maxHeight: 400,
          width: '80vw',
          maxWidth: 800,
        },
      }}
    >
      <Grid container spacing={2} sx={{ p: 2 }}>
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <Grid item xs={3} key={colIndex}>
            {books.slice(colIndex * 10, (colIndex + 1) * 10).map((book) => (
              <MenuItem
                key={book}
                onClick={() => handleBookSelect(book)}
                selected={currentBook === book}
              >
                {book}
              </MenuItem>
            ))}
          </Grid>
        ))}
      </Grid>
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
          style: {
            maxHeight: 400,
            width: 'auto',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.from({ length: chapters }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant="outlined"
              size="small"
              onClick={() => handleChapterSelect(chapter)}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                p: 0,
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
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Button
          color="inherit"
          onClick={handleOtClick}
          sx={{ minWidth: 100 }}
        >
          {currentBook && otBooks.includes(currentBook) ? currentBook : defaultOtBook}
        </Button>
        {renderBookMenu(otBooks, otAnchorEl)}

        <Button
          color="inherit"
          onClick={handleNtClick}
          sx={{ minWidth: 100 }}
        >
          {currentBook && ntBooks.includes(currentBook) ? currentBook : defaultNtBook}
        </Button>
        {renderBookMenu(ntBooks, ntAnchorEl)}

        <Button
          color="inherit"
          onClick={handleChapterClick}
          sx={{ minWidth: 100 }}
        >
          {currentChapter ? `Chapter ${currentChapter}` : 'Chapter'}
        </Button>
        {renderChapterMenu(chapterAnchorEl)}
      </Toolbar>
    </AppBar>
  );
} 