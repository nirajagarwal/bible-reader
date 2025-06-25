'use client';

import { Analytics } from "@vercel/analytics/react";
import ThemeRegistry from '@/components/ThemeRegistry';
import { SearchProvider } from '@/context/SearchContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <ThemeRegistry>
        {children}
        <Analytics />
      </ThemeRegistry>
    </SearchProvider>
  );
} 