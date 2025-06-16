'use client';

import { ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: prefersDarkMode ? '#ffffff' : '#000000',
          },
          background: {
            default: prefersDarkMode ? '#000000' : '#ffffff',
            paper: prefersDarkMode ? '#121212' : '#ffffff',
          },
        },
        typography: {
          // The font is set globally in layout.tsx
        },
        components: {
          MuiButton: {
            defaultProps: {
              variant: 'contained',
            },
            styleOverrides: {
              root: ({ ownerState, theme }) => ({
                ...(ownerState.variant === 'contained' &&
                  ownerState.color === 'primary' && {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? '#dddddd' : '#333333',
                    },
                  }),
              }),
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 