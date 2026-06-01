'use client';

import { ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

const SANS = 'var(--font-sans), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SERIF = 'var(--font-serif), "Crimson Pro", "Iowan Old Style", "Palatino", Georgia, serif';

const light = {
  parchment: '#FBF6EC',
  surface: '#FFFFFF',
  burgundy: '#7A2E29',
  burgundyHover: '#5E211D',
  gold: '#B8924A',
  goldSoft: '#E8D4A7',
  ink: '#1F1A14',
  inkMuted: '#5C5043',
  divider: '#E7DCC4',
};

const dark = {
  parchment: '#15110C',
  surface: '#1E1812',
  burgundy: '#C97A6B',
  burgundyHover: '#D89187',
  gold: '#D4A65E',
  goldSoft: '#3B2F1C',
  ink: '#F2E9D5',
  inkMuted: '#A99C84',
  divider: '#2F2820',
};

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    const c = prefersDarkMode ? dark : light;
    const isDark = prefersDarkMode;

    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: c.burgundy,
          dark: c.burgundyHover,
          contrastText: c.parchment,
        },
        secondary: {
          main: c.gold,
          light: c.goldSoft,
          contrastText: c.parchment,
        },
        background: {
          default: c.parchment,
          paper: c.surface,
        },
        text: {
          primary: c.ink,
          secondary: c.inkMuted,
        },
        divider: c.divider,
        action: {
          hover: alpha(c.gold, isDark ? 0.10 : 0.08),
          selected: alpha(c.gold, isDark ? 0.18 : 0.14),
        },
      },
      shape: {
        borderRadius: 6,
      },
      typography: {
        fontFamily: SANS,
        h6: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '0.005em' },
        h5: { fontFamily: SERIF, fontWeight: 600 },
        h4: { fontFamily: SERIF, fontWeight: 600 },
        button: { fontFamily: SANS, fontWeight: 500, letterSpacing: '0.01em' },
        body1: { fontFamily: SERIF, fontSize: '1.0625rem', lineHeight: 1.75 },
        body2: { fontFamily: SANS, lineHeight: 1.6 },
        caption: { fontFamily: SANS, letterSpacing: '0.03em' },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: c.parchment,
              backgroundImage: isDark
                ? 'none'
                : 'radial-gradient(at 100% 0%, rgba(184, 146, 74, 0.05) 0%, transparent 50%), radial-gradient(at 0% 100%, rgba(122, 46, 41, 0.04) 0%, transparent 50%)',
              backgroundAttachment: 'fixed',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            },
          },
        },
        MuiButton: {
          defaultProps: {
            variant: 'contained',
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 6,
              fontWeight: 500,
            },
            contained: {
              backgroundColor: c.burgundy,
              color: c.parchment,
              '&:hover': {
                backgroundColor: c.burgundyHover,
              },
              '&.Mui-disabled': {
                backgroundColor: alpha(c.burgundy, 0.25),
                color: alpha(c.parchment, 0.6),
              },
            },
            outlined: {
              borderColor: c.divider,
              color: c.ink,
              '&:hover': {
                borderColor: c.gold,
                backgroundColor: alpha(c.gold, 0.08),
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backdropFilter: 'saturate(180%) blur(8px)',
              backgroundColor: alpha(c.surface, 0.85),
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundImage: 'none',
              borderLeft: `1px solid ${c.divider}`,
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              border: `1px solid ${c.divider}`,
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.6)'
                : '0 8px 24px rgba(31, 26, 20, 0.10)',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontFamily: SANS,
              '&.Mui-selected': {
                backgroundColor: alpha(c.gold, 0.16),
                color: c.burgundy,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha(c.gold, 0.22),
                },
              },
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontFamily: SANS,
              textTransform: 'none',
              fontWeight: 500,
              letterSpacing: '0.01em',
              '&.Mui-selected': {
                color: c.burgundy,
              },
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              backgroundColor: c.burgundy,
              height: 2,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              color: c.inkMuted,
              '&:hover': {
                color: c.burgundy,
                backgroundColor: alpha(c.gold, 0.10),
              },
            },
          },
        },
      },
    });
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
