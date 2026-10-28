export interface MushafPageMetadata {
  page: number;
  juz: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  surahNameArabic: string;
  surahNameEnglish: string;
}

export type MushafEngine = 'plate' | 'digital';
export type PlateTheme = 'dark' | 'parchment';

export interface MushafBookmark {
  verseKey: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicName: string;
  pageNumber: number;
  createdAt: string;
}
