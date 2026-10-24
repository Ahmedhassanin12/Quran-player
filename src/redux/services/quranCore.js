import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quranCoreApi = createApi({
  reducerPath: 'quranCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.quran.com/api/v4/',
  }),
  endpoints: (builder) => ({
    getAllChapters: builder.query({
      query: () => 'chapters?language=en',
    }),
    getChapterId: builder.query({
      query: (chapterId) => `chapters/${chapterId}?language=en`,
    }),
    getChapterInfo: builder.query({
      query: (chapterId) => `chapters/${chapterId}/info?language=en`,
    }),
    getSuraAyat: builder.query({
      query: (chapterId) => `quran/verses/uthmani?chapter_number=${chapterId}`,
    }),
    getChapterVersesWithTranslation: builder.query({
      query: ({ chapterId, translationId = 20 }) => (
        `verses/by_chapter/${chapterId}?translations=${translationId}&fields=text_uthmani&per_page=300`
      ),
    }),
    getAllRecitations: builder.query({
      query: () => 'resources/recitations?language=en',
    }),
    getAllSurahAudio: builder.query({
      query: (reader = 7) => `chapter_recitations/${reader}?language=en`,
    }),
    getChapterAudioWithSegments: builder.query({
      query: ({ reader = 7, chapterId = 1 }) => (
        `chapter_recitations/${reader}/${chapterId}?segments=true`
      ),
    }),
    getVersesByPage: builder.query({
      query: ({ pageNumber = 1, mushaf = 2 }) => (
        `verses/by_page/${pageNumber}?words=true&word_fields=page_number,line_number,text_uthmani&mushaf=${mushaf}&per_page=50`
      ),
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
