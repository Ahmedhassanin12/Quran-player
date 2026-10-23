import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_RECITER } from '../../assets/recitersData';

const initialState = {
  currentSura: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSura: null,
  currentReciter: DEFAULT_RECITER,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  shuffle: false,
  isExpanded: false,
  volume: 0.8,
  seekTime: 0,
  genreListId: '',
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSura: (state, action) => {
      const { sura, i, data, audioData, reciter } = action.payload || {};

      if (sura) {
        state.activeSura = {
          ...sura,
          // ensure chapter_id is present
          chapter_id: sura.chapter_id || sura.id,
        };
      }

      if (data && Array.isArray(data)) {
        state.currentSura = data;
      } else if (audioData?.audio_files) {
        state.currentSura = audioData.audio_files;
      }

      if (typeof i === 'number') {
        state.currentIndex = i;
      }

      if (reciter) {
        state.currentReciter = reciter;
      }

      state.isActive = true;
      state.isPlaying = true;
    },

    setReciter: (state, action) => {
      state.currentReciter = action.payload;
    },

    nextSura: (state, action) => {
      if (!state.currentSura || state.currentSura.length === 0) return;

      const len = state.currentSura.length;

      if (action.payload !== undefined && typeof action.payload === 'number') {
        const nextIdx = (action.payload + len) % len;
        state.currentIndex = nextIdx;
        state.activeSura = state.currentSura[nextIdx];
      } else if (state.repeatMode === 'one') {
        // Repeat current
        state.isPlaying = true;
      } else if (state.shuffle) {
        const randomIdx = Math.floor(Math.random() * len);
        state.currentIndex = randomIdx;
        state.activeSura = state.currentSura[randomIdx];
      } else {
        const nextIdx = state.currentIndex + 1;
        if (nextIdx < len) {
          state.currentIndex = nextIdx;
          state.activeSura = state.currentSura[nextIdx];
        } else if (state.repeatMode === 'all') {
          state.currentIndex = 0;
          [state.activeSura] = state.currentSura;
        } else {
          state.isPlaying = false;
        }
      }

      state.isActive = true;
    },

    prevSura: (state, action) => {
      if (!state.currentSura || state.currentSura.length === 0) return;

      const len = state.currentSura.length;

      if (action.payload !== undefined && typeof action.payload === 'number') {
        const prevIdx = (action.payload + len) % len;
        state.currentIndex = prevIdx;
        state.activeSura = state.currentSura[prevIdx];
      } else if (state.shuffle) {
        const randomIdx = Math.floor(Math.random() * len);
        state.currentIndex = randomIdx;
        state.activeSura = state.currentSura[randomIdx];
      } else {
        const prevIdx = (state.currentIndex - 1 + len) % len;
        state.currentIndex = prevIdx;
        state.activeSura = state.currentSura[prevIdx];
      }

      state.isActive = true;
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },

    cycleRepeatMode: (state) => {
      if (state.repeatMode === 'off') state.repeatMode = 'all';
      else if (state.repeatMode === 'all') state.repeatMode = 'one';
      else state.repeatMode = 'off';
    },

    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    setVolume: (state, action) => {
      state.volume = Number(action.payload);
    },

    setSeekTime: (state, action) => {
      state.seekTime = action.payload;
    },

    setIsExpanded: (state, action) => {
      state.isExpanded = action.payload;
    },

    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },

    selectGenreListId: (state, action) => {
      state.genreListId = action.payload;
    },
  },
});

export const {
  setActiveSura,
  setReciter,
  nextSura,
  prevSura,
  playPause,
  togglePlayPause,
  setRepeatMode,
  cycleRepeatMode,
  toggleShuffle,
  setVolume,
  setSeekTime,
  setIsExpanded,
  toggleExpanded,
  selectGenreListId,
} = playerSlice.actions;

export default playerSlice.reducer;
