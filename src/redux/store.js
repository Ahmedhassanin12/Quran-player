import { configureStore } from '@reduxjs/toolkit';
// import { curryGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware';

import { quranCoreApi } from './services/quranCore';
import playerReducer from './features/playerSlice';
import downloadsReducer from './features/downloadsSlice';

export const store = configureStore({
  reducer: {
    [quranCoreApi.reducerPath]: quranCoreApi.reducer,
    player: playerReducer,
    downloads: downloadsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(quranCoreApi.middleware),
});
