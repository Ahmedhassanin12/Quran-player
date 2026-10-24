import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_RECITER } from '../../assets/recitersData';
import { storageService } from '../../services/storageService';

const savedSettings = storageService.getSettings();
const savedFavorites = storageService.getFavorites();
const savedFavoriteReciters = storageService.getFavoriteReciters();
const savedRecents = storageService.getRecents();
const savedLastSession = storageService.getLastSession();

const initialState = {
  currentSura: [],
  currentIndex: 0,
  isActive: Boolean(savedLastSession?.activeSura),
  isPlaying: false,
  activeSura: savedLastSession?.activeSura || null,
  currentReciter: savedLastSession?.currentReciter || DEFAULT_RECITER,
  repeatMode: 'off', // 'off' | 'all' | 'one'
  shuffle: false,
  isExpanded: false,
  volume: typeof savedSettings?.volume === 'number' ? savedSettings.volume : 0.8,
  playbackSpeed: typeof savedSettings?.speed === 'number' ? savedSettings.speed : 1.0,
  seekTime: savedLastSession?.progressSeconds || 0,
  seekCount: 0,
  genreListId: '',
  // Phase 2.5 Discover & Personalization state
  favorites: savedFavorites,
  favoriteReciters: savedFavoriteReciters,
  recents: savedRecents,
  lastSession: savedLastSession,
  // Sleep Timer state
  sleepTimer: {
    active: false,
    mode: null, // 'surah' | '15' | '30' | '45' | '60'
    remainingSeconds: 0,
    isFadingOut: false,
  },
  // Hifz Looping state
  hifzMode: {
    active: false,
    startVerse: 1,
    endVerse: 1,
    targetLoops: 3,
    currentLoop: 1,
  },
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

      // Automatically record in recently played history
      if (state.activeSura) {
        const recentItem = {
          surahId: state.activeSura.chapter_id || state.activeSura.id,
          surahName: state.activeSura.name_simple || state.activeSura.name || `Surah ${state.activeSura.chapter_id || state.activeSura.id}`,
          arabicName: state.activeSura.name_arabic || '',
          reciterId: state.currentReciter?.id || DEFAULT_RECITER.id,
          reciterName: state.currentReciter?.reciter_name || DEFAULT_RECITER.reciter_name,
        };
        state.recents = storageService.addRecent(recentItem);

        // Update lastSession
        const session = {
          activeSura: state.activeSura,
          currentReciter: state.currentReciter,
          progressSeconds: 0,
        };
        state.lastSession = session;
        storageService.saveLastSession(session);
      }
    },

    setReciter: (state, action) => {
      state.currentReciter = action.payload;
      if (state.activeSura) {
        const session = {
          ...state.lastSession,
          currentReciter: action.payload,
        };
        state.lastSession = session;
        storageService.saveLastSession(session);
      }
    },

    nextSura: (state, action) => {
      if (!state.currentSura || state.currentSura.length === 0) return;

      const len = state.currentSura.length;

      if (action.payload !== undefined && typeof action.payload === 'number') {
        const nextIdx = (action.payload + len) % len;
        state.currentIndex = nextIdx;
        state.activeSura = state.currentSura[nextIdx];
      } else if (state.repeatMode === 'one') {
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

      // Update history
      if (state.activeSura) {
        const recentItem = {
          surahId: state.activeSura.chapter_id || state.activeSura.id,
          surahName: state.activeSura.name_simple || state.activeSura.name || `Surah ${state.activeSura.chapter_id || state.activeSura.id}`,
          arabicName: state.activeSura.name_arabic || '',
          reciterId: state.currentReciter?.id || DEFAULT_RECITER.id,
          reciterName: state.currentReciter?.reciter_name || DEFAULT_RECITER.reciter_name,
        };
        state.recents = storageService.addRecent(recentItem);
      }
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
      storageService.saveSettings({
        volume: state.volume,
        speed: state.playbackSpeed,
      });
    },

    setPlaybackSpeed: (state, action) => {
      const speed = Number(action.payload);
      if (speed >= 0.75 && speed <= 1.25) {
        state.playbackSpeed = speed;
        storageService.saveSettings({
          volume: state.volume,
          speed: state.playbackSpeed,
        });
      }
    },

    setSeekTime: (state, action) => {
      state.seekTime = action.payload;
      state.seekCount = (state.seekCount || 0) + 1;
    },

    savePlaybackProgress: (state, action) => {
      const seconds = Number(action.payload);
      if (state.activeSura) {
        const session = {
          activeSura: state.activeSura,
          currentReciter: state.currentReciter,
          progressSeconds: Math.floor(seconds),
        };
        state.lastSession = session;
        storageService.saveLastSession(session);
      }
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

    // Favorites
    toggleFavoriteSurah: (state, action) => {
      state.favorites = storageService.toggleFavorite(action.payload);
    },

    toggleFavoriteReciter: (state, action) => {
      state.favoriteReciters = storageService.toggleFavoriteReciter(action.payload);
    },

    // Sleep Timer
    setSleepTimer: (state, action) => {
      const { mode, minutes } = action.payload;
      state.sleepTimer = {
        active: true,
        mode,
        remainingSeconds: minutes ? minutes * 60 : 0,
        isFadingOut: false,
      };
    },

    decrementSleepTimer: (state) => {
      if (!state.sleepTimer.active) return;
      if (state.sleepTimer.mode !== 'surah') {
        const rem = state.sleepTimer.remainingSeconds - 1;
        if (rem <= 0) {
          state.sleepTimer = {
            active: false,
            mode: null,
            remainingSeconds: 0,
            isFadingOut: false,
          };
          state.isPlaying = false;
        } else {
          state.sleepTimer.remainingSeconds = rem;
          state.sleepTimer.isFadingOut = rem <= 30;
        }
      }
    },

    triggerSurahSleepStop: (state) => {
      if (state.sleepTimer.active && state.sleepTimer.mode === 'surah') {
        state.sleepTimer = {
          active: false,
          mode: null,
          remainingSeconds: 0,
          isFadingOut: false,
        };
        state.isPlaying = false;
      }
    },

    clearSleepTimer: (state) => {
      state.sleepTimer = {
        active: false,
        mode: null,
        remainingSeconds: 0,
        isFadingOut: false,
      };
    },

    // Hifz Looping
    setHifzMode: (state, action) => {
      state.hifzMode = {
        ...state.hifzMode,
        ...action.payload,
      };
    },

    incrementHifzLoop: (state) => {
      if (!state.hifzMode.active) return;
      if (state.hifzMode.currentLoop < state.hifzMode.targetLoops) {
        state.hifzMode.currentLoop += 1;
      } else {
        // finished loop target
        state.hifzMode.active = false;
      }
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
  setPlaybackSpeed,
  setSeekTime,
  savePlaybackProgress,
  setIsExpanded,
  toggleExpanded,
  selectGenreListId,
  toggleFavoriteSurah,
  toggleFavoriteReciter,
  setSleepTimer,
  decrementSleepTimer,
  triggerSurahSleepStop,
  clearSleepTimer,
  setHifzMode,
  incrementHifzLoop,
} = playerSlice.actions;

export default playerSlice.reducer;
