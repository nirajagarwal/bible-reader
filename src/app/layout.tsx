import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"
import ThemeRegistry from '@/components/ThemeRegistry';
import { SearchProvider } from '@/context/SearchContext'
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
        <ThemeRegistry>
          <SearchProvider>
            {children}
            <Analytics />
          </SearchProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
} 