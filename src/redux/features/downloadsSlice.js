import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  downloadService,
  makeDownloadKey,
} from '../../services/downloadService';

export const hydrateDownloads = createAsyncThunk(
  'downloads/hydrate',
  async () => downloadService.list(),
);

export const downloadSurah = createAsyncThunk(
  'downloads/downloadSurah',
  async (payload, { rejectWithValue }) => {
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

    // No-op if already present (same surah + reciter)
    const existing = await downloadService.get(reader, id);
    if (existing?.blob) {
      return {
        key: existing.key,
        surahId: existing.surahId,
        reciterId: existing.reciterId,
        reciterName: existing.reciterName,
        surahName: existing.surahName,
        arabicName: existing.arabicName,
        sourceUrl: existing.sourceUrl,
        sizeBytes: existing.sizeBytes,
        mimeType: existing.mimeType,
        downloadedAt: existing.downloadedAt,
      };
    }

    try {
      const { blob, mimeType, sizeBytes } = await downloadService.fetchAudioBlob(audioUrl);
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
    } catch (err) {
      return rejectWithValue(err?.message || 'Download failed');
    }
  },
);

export const removeDownload = createAsyncThunk(
  'downloads/remove',
  async ({ reciterId, surahId }, { rejectWithValue }) => {
    try {
      const key = await downloadService.remove(reciterId, surahId);
      return { key, reciterId: Number(reciterId), surahId: Number(surahId) };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to remove download');
    }
  },
);

const initialState = {
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
    clearDownloadError: (state, action) => {
      const key = action.payload;
      if (key && state.errorByKey[key]) {
        delete state.errorByKey[key];
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

export const selectDownloadItems = (state) => state.downloads.items;
export const selectDownloadsHydrated = (state) => state.downloads.hydrated;
export const selectIsDownloaded = (reciterId, surahId) => (state) => {
  const key = makeDownloadKey(reciterId, surahId);
  return state.downloads.items.some((item) => item.key === key);
};
export const selectDownloadStatus = (reciterId, surahId) => (state) => {
  const key = makeDownloadKey(reciterId, surahId);
  return state.downloads.statusByKey[key] || 'idle';
};
export const selectDownloadError = (reciterId, surahId) => (state) => {
  const key = makeDownloadKey(reciterId, surahId);
  return state.downloads.errorByKey[key] || null;
};
export const selectTotalDownloadBytes = (state) =>
  state.downloads.items.reduce((sum, item) => sum + (Number(item.sizeBytes) || 0), 0);

export default downloadsSlice.reducer;
