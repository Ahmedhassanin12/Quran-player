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
    getAllRecitations: builder.query({
      query: () => 'resources/recitations?language=en',
    }),
    getAllSurahAudio: builder.query({
      query: (reader = 7) => `chapter_recitations/${reader}?language=en`,
    }),
  }),
});

export const {
  useGetAllChaptersQuery,
  useGetChapterIdQuery,
  useGetChapterInfoQuery,
  useGetSuraAyatQuery,
  useGetAllRecitationsQuery,
  useGetAllSurahAudioQuery,
} = quranCoreApi;
