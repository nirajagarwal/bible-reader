export type Testament = 'OT' | 'NT';

export interface Book {
  id: string;
  name: string;
  testament: Testament;
  chapters: number;
}

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

export interface Commentary {
  verse: string;
  text: string;
  timestamp: number;
}

export interface ReadingState {
  book: string;
  chapter: number;
  scrollPosition: number;
} 