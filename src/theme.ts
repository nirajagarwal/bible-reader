'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#5f5f5f',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          ...(theme.palette.mode === 'light' && {
            '&.MuiButton-contained': {
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              },
            },
          }),
          ...(theme.palette.mode === 'dark' && {
            '&.MuiButton-contained': {
              backgroundColor: '#fff',
              color: '#000',
              '&:hover': {
                backgroundColor: '#ccc',
              },
            },
          }),
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#000000'
        }
      }
    }
  },
});

export default theme; 