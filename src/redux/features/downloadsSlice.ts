import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  downloadService,
  makeDownloadKey,
} from '../../services/downloadService';
import type {
  DownloadedSurahMetadata,
  DownloadsState,
  DownloadStatus,
} from '../../types/downloads';

export interface DownloadSurahPayload {
  surahId: number | string;
  reciterId: number | string;
  reciterName?: string;
  surahName?: string;
  arabicName?: string;
  audioUrl?: string;
}

export const hydrateDownloads = createAsyncThunk<DownloadedSurahMetadata[]>(
  'downloads/hydrate',
  async () => downloadService.list(),
);

export const downloadSurah = createAsyncThunk<
  DownloadedSurahMetadata,
  DownloadSurahPayload,
  { state: { downloads: DownloadsState }; rejectValue: string }
>(
  'downloads/downloadSurah',
  async (payload, { rejectWithValue, signal }) => {
    const {
      surahId,
      reciterId,
      reciterName = '',
      surahName = '',
      arabicName = '',
      audioUrl,
    } = payload || {};

    const id = Number(surahId);
    const reader = Number(reciterId);

    if (!id || !reader) {
      return rejectWithValue('Missing surah or reciter');
    }

    if (!audioUrl) {
      return rejectWithValue('Audio URL unavailable for this recitation');
    }

    // Fast existence check without loading binary blob into memory
    const existing = await downloadService.getMetadata(reader, id);
    if (existing) {
      return existing;
    }

    try {
      const { blob, mimeType, sizeBytes } = await downloadService.fetchAudioBlob(audioUrl, { signal });
      const meta = await downloadService.put({
        key: makeDownloadKey(reader, id),
        surahId: id,
        reciterId: reader,
        reciterName,
        surahName: surahName || `Surah ${id}`,
        arabicName,
        sourceUrl: audioUrl,
        blob,
        mimeType,
        sizeBytes,
      });
      return meta;
    } catch (err: unknown) {
      const e = err as { message?: string };
      return rejectWithValue(e?.message || 'Download failed');
    }
  },
  {
    // Concurrency guard: ignore if a download for this surah/reciter is already in-flight
    condition: (payload, { getState }) => {
      const { surahId, reciterId } = payload || {};
      const key = makeDownloadKey(reciterId, surahId);
      const status = getState()?.downloads?.statusByKey?.[key];
      if (status === 'downloading') {
        return false;
      }
      return true;
    },
  },
);

export const removeDownload = createAsyncThunk<
  { key: string; reciterId: number; surahId: number },
  { reciterId: number | string; surahId: number | string },
  { rejectValue: string }
>(
  'downloads/remove',
  async ({ reciterId, surahId }, { rejectWithValue }) => {
    try {
      const key = await downloadService.remove(reciterId, surahId);
      return { key, reciterId: Number(reciterId), surahId: Number(surahId) };
    } catch (err: unknown) {
      const e = err as { message?: string };
      return rejectWithValue(e?.message || 'Failed to remove download');
    }
  },
);

export const clearAllDownloads = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'downloads/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await downloadService.clearAll();
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      return rejectWithValue(e?.message || 'Failed to clear all downloads');
    }
  },
);

const initialState: DownloadsState = {
  items: [],
  statusByKey: {},
  errorByKey: {},
  hydrated: false,
  hydrating: false,
};

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    clearDownloadError: (state, action: PayloadAction<string | { reciterId: number | string; surahId: number | string }>) => {
      const key = typeof action.payload === 'string'
        ? action.payload
        : makeDownloadKey(action.payload?.reciterId, action.payload?.surahId);
      if (key) {
        delete state.errorByKey[key];
        if (state.statusByKey[key] === 'error') {
          delete state.statusByKey[key];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateDownloads.pending, (state) => {
        state.hydrating = true;
      })
      .addCase(hydrateDownloads.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.hydrated = true;
        state.hydrating = false;
      })
      .addCase(hydrateDownloads.rejected, (state) => {
        state.hydrated = true;
        state.hydrating = false;
      })
      .addCase(downloadSurah.pending, (state, action) => {
        const { surahId, reciterId } = action.meta.arg || {};
        const key = makeDownloadKey(reciterId, surahId);
        state.statusByKey[key] = 'downloading';
        delete state.errorByKey[key];
      })
      .addCase(downloadSurah.fulfilled, (state, action) => {
        const meta = action.payload;
        if (!meta?.key) return;
        state.statusByKey[meta.key] = 'idle';
        delete state.errorByKey[meta.key];
        const idx = state.items.findIndex((item) => item.key === meta.key);
        if (idx >= 0) {
          state.items[idx] = meta;
        } else {
          state.items = [meta, ...state.items];
        }
      })
      .addCase(downloadSurah.rejected, (state, action) => {
        const { surahId, reciterId } = action.meta.arg || {};
        const key = makeDownloadKey(reciterId, surahId);
        state.statusByKey[key] = 'error';
        state.errorByKey[key] = action.payload || action.error?.message || 'Download failed';
      })
      .addCase(clearAllDownloads.fulfilled, (state) => {
        state.items = [];
        state.statusByKey = {};
        state.errorByKey = {};
      })
      .addCase(removeDownload.fulfilled, (state, action) => {
        const { key } = action.payload || {};
        state.items = state.items.filter((item) => item.key !== key);
        if (key) {
          delete state.statusByKey[key];
          delete state.errorByKey[key];
        }
      });
  },
});

export const { clearDownloadError } = downloadsSlice.actions;

export const selectDownloadItems = (state: { downloads: DownloadsState }): DownloadedSurahMetadata[] => state.downloads.items;
export const selectDownloadsHydrated = (state: { downloads: DownloadsState }): boolean => state.downloads.hydrated;
export const selectIsDownloaded = (reciterId: number | string, surahId: number | string) =>
  (state: { downloads: DownloadsState }): boolean => {
    const key = makeDownloadKey(reciterId, surahId);
    return state.downloads.items.some((item) => item.key === key);
  };
export const selectDownloadStatus = (reciterId: number | string, surahId: number | string) =>
  (state: { downloads: DownloadsState }): DownloadStatus => {
    const key = makeDownloadKey(reciterId, surahId);
    return state.downloads.statusByKey[key] || 'idle';
  };
export const selectDownloadError = (reciterId: number | string, surahId: number | string) =>
  (state: { downloads: DownloadsState }): string | null => {
    const key = makeDownloadKey(reciterId, surahId);
    return state.downloads.errorByKey[key] || null;
  };
export const selectTotalDownloadBytes = (state: { downloads: DownloadsState }): number =>
  state.downloads.items.reduce((sum, item) => sum + (Number(item.sizeBytes) || 0), 0);

export default downloadsSlice.reducer;
