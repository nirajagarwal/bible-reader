import { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputBase,
  Paper,
  IconButton,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScaleLoader from 'react-spinners/ScaleLoader';

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface SearchProps {
  onVerseSelect: (book: string, chapter: number, verse: number) => void;
}

const cache = new Map();

export default function Search({ onVerseSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [lastTappedVerseId, setLastTappedVerseId] = useState<string | null>(null);
  const theme = useTheme();
  
  const resultsListRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    if (isPanelOpen && lastTappedVerseId && resultsListRef.current) {
        const item = resultsListRef.current.querySelector(`[data-verse-id="${lastTappedVerseId}"]`);
        if(item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [isPanelOpen, lastTappedVerseId]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setIsPanelOpen(true);

    if (cache.has(query)) {
        const cached = cache.get(query);
        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
            setResults(cached.data);
            setLoading(false);
            return;
        }
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
      cache.set(query, { data: data.results, timestamp: Date.now() });

    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerseClick = (result: SearchResult) => {
    const { book, chapter, verse } = result;
    setLastTappedVerseId(`${book}-${chapter}-${verse}`);
    onVerseSelect(book, chapter, verse);
    // Panel remains open as per requirements
  };
  
  const handleCopy = () => {
    const textToCopy = results.map(r => `${r.book} ${r.chapter}:${r.verse} - ${r.text}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Box sx={{ 
      position: 'relative',
      width: { xs: '280px', sm: '320px', md: '480px' }
    }}>
      <Paper
        component="form"
        variant="outlined"
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsPanelOpen(true); }}
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

      {isPanelOpen && (
        <Paper sx={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          zIndex: 1200, // Above AppBar
          height: 'calc(100vh - 120px)', // Adjust based on nav height
          display: 'flex',
          flexDirection: 'column'
        }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ml: 1}}>Search Results</Typography>
                <Box>
                    {results.length > 0 && (
                        <IconButton onClick={handleCopy} size="small">
                            <ContentCopyIcon fontSize="small"/>
                        </IconButton>
                    )}
                    <IconButton onClick={() => setIsPanelOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {loading && <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><ScaleLoader color={theme.palette.text.secondary} /></Box>}
                {error && <Typography color="error" sx={{p: 2}}>{error}</Typography>}
                {!loading && !error && results.length === 0 && (
                    <Typography color="text.secondary" sx={{p: 2}}>No results found for your query.</Typography>
                )}
                {!loading && !error && results.length > 0 && (
                    <List ref={resultsListRef}>
                        {results.map((result) => (
                             <ListItem
                                button
                                key={`${result.book}-${result.chapter}-${result.verse}`}
                                data-verse-id={`${result.book}-${result.chapter}-${result.verse}`}
                                onClick={() => handleVerseClick(result)}
                                sx={{ 
                                    borderBottom: 1, 
                                    borderColor: 'divider',
                                    backgroundColor: lastTappedVerseId === `${result.book}-${result.chapter}-${result.verse}` ? 'action.selected' : 'transparent'
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
        </Paper>
      )}
    </Box>
  );
} 