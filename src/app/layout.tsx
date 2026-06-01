import { Providers } from './providers';
import { Metadata, Viewport } from 'next';
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_ENV === 'production'
    ? 'https://bereanbible.online'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

const TITLE = 'Berean Bible — AI Commentary & Semantic Search';
const DESCRIPTION =
  'A modern Bible reader with in-depth AI commentary on every verse and semantic search to find related passages across all 66 books.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: '%s · Berean Bible',
  },
  description: DESCRIPTION,
  applicationName: 'Berean Bible',
  generator: 'Next.js',
  keywords: [
    'Bible',
    'Berean Bible',
    'Bible reader',
    'Bible study',
    'Scripture',
    'AI Bible commentary',
    'AI commentary',
    'semantic Bible search',
    'related verses',
    'Old Testament',
    'New Testament',
    'Bible online',
    'free Bible',
    'self study Bible',
  ],
  authors: [{ name: 'Berean Bible' }],
  creator: 'Berean Bible',
  publisher: 'Berean Bible',
  category: 'religion',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: siteUrl,
    siteName: 'Berean Bible',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@bereanbible',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: 'Berean Bible',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF6EC' },
    { media: '(prefers-color-scheme: dark)', color: '#15110C' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
