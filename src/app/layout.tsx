import { Providers } from './providers';
import { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.VERCEL_ENV === 'production' 
  ? 'https://berean-bible.vercel.app' 
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
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