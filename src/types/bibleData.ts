export interface BibleData {
  [book: string]: {
    chapters: { [chapter: string]: string[] };
    testament: string;
  };
} 