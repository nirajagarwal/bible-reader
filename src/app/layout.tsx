import { Providers } from './providers';
import { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = 'https://berean-bible.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.berean.bible'),
  title: 'Berean Bible Reader',
  description: 'Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.',
  openGraph: {
    title: 'Berean Bible Reader',
    description: 'AI commentary and semantic search for the Bible.',
    images: [{
      url: '/og.png',
      width: 1200,
      height: 630,
      alt: 'Berean Bible Reader',
    }],
    type: 'website',
    url: 'https://www.berean.bible',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berean Bible Reader',
    description: 'AI commentary and semantic search for the Bible.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 