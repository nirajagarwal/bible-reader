import { Providers } from './providers';
import { Metadata } from 'next';

const siteUrl = 'https://berean-bible.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Berean Bible Reader',
  description: 'Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.',
  openGraph: {
    title: 'Berean Bible Reader',
    description: 'Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.',
    images: [
      {
        url: `/api/og?title=Berean Bible Reader&description=Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.`,
        width: 1200,
        height: 630,
        alt: 'Berean Bible Reader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berean Bible Reader',
    description: 'Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.',
    images: [`/api/og?title=Berean Bible Reader&description=Read with in-depth AI commentary for each verse and semantic search to find related verses for self-study.`],
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