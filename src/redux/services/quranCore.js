import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quranCoreApi = createApi({
  reducerPath: 'quranCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.quran.com/api/v4/',
    // prepareHeaders: (headers) => {
    //   headers.set(
    //     "X-RapidAPI-Key",
    //     "d17491e321msh703cac67a0fdc65p107eb3jsna3bd4ecd4933"
    //   );

    //   return headers;
    // },
  }),
  endpoints: (builder) => ({
    getAllChapters: builder.query({ query: () => '/chapters' }),
    getChapterId: builder.query({
      query: (chapterId) => `/chapters/${chapterId}`,
    }),
    getChapterInfo: builder.query({
      query: (chapterId) => `chapters/${chapterId}/info?language=en`,
    }),
    getSuraAyat: builder.query({
      query: (chapterId) => `/quran/verses/imlaei/?chapter_number=${chapterId}`,
    }),
    getAllRecitations: builder.query({
      query: () => 'resources/recitations',
    }),
    getAllSurahAudio: builder.query({
      query: (reader) => `/chapter_recitations/${reader}?language=en`,
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
