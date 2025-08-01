'use client';

import { createContext, useState, useContext, ReactNode } from 'react';
import { SearchResult } from '@/types/bible';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  oldTestamentResults: SearchResult[];
  newTestamentResults: SearchResult[];
  setSearchResults: (oldTestament: SearchResult[], newTestament: SearchResult[]) => void;
  activeTab: 'NT' | 'OT';
  setActiveTab: (tab: 'NT' | 'OT') => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [oldTestamentResults, setOldTestamentResults] = useState<SearchResult[]>([]);
  const [newTestamentResults, setNewTestamentResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'NT' | 'OT'>('NT'); // Default to New Testament

  const setSearchResults = (oldTestament: SearchResult[], newTestament: SearchResult[]) => {
    setOldTestamentResults(oldTestament);
    setNewTestamentResults(newTestament);
  };

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      oldTestamentResults,
      newTestamentResults,
      setSearchResults,
      activeTab,
      setActiveTab
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 