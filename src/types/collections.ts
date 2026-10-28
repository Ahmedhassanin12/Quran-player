export interface CuratedCollection {
  id: string;
  title: string;
  arabic_title: string;
  badge: string;
  description: string;
  citation: string;
  surahIds: number[];
  accent: string;
  icon: 'sun' | 'moon' | 'shield' | 'heart' | 'book-open' | string;
}
