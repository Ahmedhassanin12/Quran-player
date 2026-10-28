import type { Reciter } from './reciter';

export interface TranslatedName {
  language_name: string;
  name: string;
}

export interface Chapter {
  id: number;
  chapter_id?: number;
  revelation_place: 'makkah' | 'madinah' | string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: TranslatedName;
}

export interface ChapterInfo {
  id: number;
  chapter_id: number;
  language_name: string;
  short_text: string;
  source: string;
  text: string;
}

export interface AudioFile {
  id?: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
  duration?: number;
}

export type AudioTimestampSegment = [number, number, number];

export interface AudioTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments: AudioTimestampSegment[];
}

export interface ChapterAudioWithSegmentsResponse {
  audio_file: {
    id: number;
    chapter_id: number;
    file_size: number;
    format: string;
    audio_url: string;
    duration: number;
    timestamps?: AudioTimestamp[];
  };
}

export interface Word {
  id: number;
  position: number;
  audio_url?: string;
  text_uthmani: string;
  page_number: number;
  line_number: number;
  code_v1?: string;
  translation?: {
    text: string;
    language_name?: string;
  };
  transliteration?: {
    text: string;
    language_name?: string;
  };
  verse_key?: string;
  verse_number?: number;
}

export interface VerseTranslation {
  id: number;
  resource_id: number;
  text: string;
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number?: number;
  rub_el_hizb_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  sajdah_number?: number | null;
  text_uthmani: string;
  page_number?: number;
  juz_number?: number;
  words?: Word[];
  translations?: VerseTranslation[];
}

/**
 * Composite Surah model used throughout audio playback, cards, and queue.
 */
export interface Surah extends Partial<Chapter> {
  id: number;
  chapter_id?: number;
  name?: string;
  name_simple?: string;
  name_arabic?: string;
  audio_url?: string;
  reciter_id?: number;
  reciter_name?: string;
  reciter?: Reciter;
  file_size?: number;
  downloaded?: boolean;
  downloadedAt?: string;
  sizeBytes?: number;
  downloadKey?: string;
}
