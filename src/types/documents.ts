// src/types/documents.ts

export interface Document {
  id: string;
  title: string;
  date: string;
  score?: boolean;
  download?: boolean;
  remove?: boolean;
}
