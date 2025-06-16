import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from '@mui/material/styles'
import theme from '@/theme'
import { SearchProvider } from '@/context/SearchContext'
import CssBaseline from '@mui/material/CssBaseline'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bible Reader',
  description: 'A simple bible reader app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <SearchProvider>
            <CssBaseline />
            {children}
            <Analytics />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 