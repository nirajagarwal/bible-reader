import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeRegistry from '@/components/ThemeRegistry'
import CssBaseline from '@mui/material/CssBaseline'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://berean-bible.vercel.app/'),
  title: {
    default: 'Berean Bible',
    template: `%s | Berean Bible`,
  },
  description: 'Berean Bible reader with AI-powered semantic search and commentary.',
  manifest: '/manifest.json',
  keywords: ['berean', 'bible', 'reader', 'semantic', 'search', 'commentary', 'ai'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Berean Bible',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <CssBaseline />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
} 