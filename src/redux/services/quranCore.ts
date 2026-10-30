import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Chapter,
  ChapterInfoResponse,
  AudioFile,
  Verse,
  ChapterAudioWithSegmentsResponse,
} from '../../types/quran';

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface ChapterResponse {
  chapter: Chapter;
}

export type { ChapterInfoResponse };

export interface VersesResponse {
  verses: Verse[];
}

export interface AudioFilesResponse {
  audio_files: AudioFile[];
}

export interface RecitationsResponse {
  recitations: Array<{
    id: number;
    reciter_name: string;
    style?: string;
    translated_name: { name: string; language_name: string };
  }>;
}

export interface VersesByPageResponse {
  verses: Verse[];
  pagination?: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

export const quranCoreApi = createApi({
  reducerPath: 'quranCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.quran.com/api/v4/',
  }),
  endpoints: (builder) => ({
    getAllChapters: builder.query<ChaptersResponse, string | void>({
      query: (language = 'en') => `chapters?language=${language || 'en'}`,
    }),
    getChapterId: builder.query<ChapterResponse, number | string | { chapterId: number | string; language?: string }>({
      query: (arg) => {
        if (typeof arg === 'object' && arg !== null) {
          return `chapters/${arg.chapterId}?language=${arg.language || 'en'}`;
        }
        return `chapters/${arg}?language=en`;
      },
    }),
    getChapterInfo: builder.query<
      ChapterInfoResponse,
      number | string | { chapterId: number | string; language?: string }
    >({
      query: (arg) => {
        if (typeof arg === 'object' && arg !== null) {
          return `chapters/${arg.chapterId}/info?language=${arg.language || 'en'}`;
        }
        return `chapters/${arg}/info?language=en`;
      },
    }),
    getSuraAyat: builder.query<VersesResponse, number | string>({
      query: (chapterId) => `quran/verses/uthmani?chapter_number=${chapterId}`,
    }),
    getChapterVersesWithTranslation: builder.query<
      VersesResponse,
      { chapterId: number | string; translationId?: number | string }
    >({
      query: ({ chapterId, translationId = 20 }) =>
        `verses/by_chapter/${chapterId}?translations=${translationId}&fields=text_uthmani&per_page=300`,
    }),
    getAllRecitations: builder.query<RecitationsResponse, string | void>({
      query: (language = 'en') => `resources/recitations?language=${language || 'en'}`,
    }),
    getAllSurahAudio: builder.query<AudioFilesResponse, number | string | void>({
      query: (reader = 7) => `chapter_recitations/${reader || 7}?language=en`,
    }),
    getChapterAudioWithSegments: builder.query<
      ChapterAudioWithSegmentsResponse,
      { reader?: number | string; chapterId?: number | string }
    >({
      query: ({ reader = 7, chapterId = 1 }) =>
        `chapter_recitations/${reader}/${chapterId}?segments=true`,
    }),
    getVersesByPage: builder.query<
      VersesByPageResponse,
      { pageNumber?: number | string; mushaf?: number | string }
    >({
      query: ({ pageNumber = 1, mushaf = 2 }) =>
        `verses/by_page/${pageNumber}?words=true&word_fields=page_number,line_number,text_uthmani&mushaf=${mushaf}&per_page=50`,
    }),
  }),
});

export const {
  useGetAllChaptersQuery,
  useGetChapterIdQuery,
  useGetChapterInfoQuery,
  useGetSuraAyatQuery,
  useGetChapterVersesWithTranslationQuery,
  useGetAllRecitationsQuery,
  useGetAllSurahAudioQuery,
  useGetChapterAudioWithSegmentsQuery,
  useGetVersesByPageQuery,
} = quranCoreApi;
