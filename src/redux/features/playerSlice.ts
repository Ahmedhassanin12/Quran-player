import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_RECITER } from '../../assets/recitersData';
import { storageService } from '../../services/storageService';
import type {
  PlayerState,
  RepeatMode,
  SleepTimerMode,
  HifzModeState,
  RecentRecitation,
} from '../../types/player';
import type { Surah, AudioFile } from '../../types/quran';
import type { Reciter } from '../../types/reciter';

const savedSettings = storageService.getSettings();
const savedFavorites = storageService.getFavorites();
const savedFavoriteReciters = storageService.getFavoriteReciters();
const savedRecents = storageService.getRecents();
const savedLastSession = storageService.getLastSession();

const initialState: PlayerState = {
  currentSura: [],
  currentIndex: 0,
  isActive: Boolean(savedLastSession?.activeSura),
  isPlaying: false,
  activeSura: savedLastSession?.activeSura || null,
  currentReciter: savedLastSession?.currentReciter || DEFAULT_RECITER,
  repeatMode: 'off',
  shuffle: false,
  isExpanded: false,
  volume: typeof savedSettings?.volume === 'number' ? savedSettings.volume : 0.8,
  playbackSpeed: typeof savedSettings?.speed === 'number' ? savedSettings.speed : 1.0,
  seekTime: savedLastSession?.progressSeconds || 0,
  seekCount: 0,
  favorites: savedFavorites,
  favoriteReciters: savedFavoriteReciters,
  recents: savedRecents,
  lastSession: savedLastSession,
  sleepTimer: {
    active: false,
    mode: null,
    remainingSeconds: 0,
    isFadingOut: false,
  },
  hifzMode: {
    active: false,
    startVerse: 1,
    endVerse: 1,
    targetLoops: 3,
    currentLoop: 1,
  },
};

export interface SetActiveSuraPayload {
  sura?: Surah;
  i?: number;
  data?: Surah[];
  audioData?: AudioFile[] | { audio_files?: AudioFile[] };
  reciter?: Reciter;
}

export interface SetSleepTimerPayload {
  mode: SleepTimerMode;
  minutes?: number;
}

/** Pure helper to push and deduplicate recent recitations (max 20) */
const addRecentToState = (
  recents: RecentRecitation[],
  item: RecentRecitation,
): RecentRecitation[] => {
  const filtered = recents.filter(
    (existing) => !(existing.surahId === item.surahId && existing.reciterId === item.reciterId),
  );
  return [{ ...item, playedAt: new Date().toISOString() }, ...filtered].slice(0, 20);
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSura: (state, action: PayloadAction<SetActiveSuraPayload | undefined>) => {
      const { sura, i, data, audioData, reciter } = action.payload || {};

      if (sura) {
        state.activeSura = {
          ...sura,
          chapter_id: sura.chapter_id || sura.id,
        };
      }

      if (data && Array.isArray(data)) {
        state.currentSura = data;
      } else if (Array.isArray(audioData)) {
        state.currentSura = audioData.map((file) => ({
          id: file.chapter_id,
          chapter_id: file.chapter_id,
          audio_url: file.audio_url,
          file_size: file.file_size,
        }));
      } else if (audioData && 'audio_files' in audioData && Array.isArray(audioData.audio_files)) {
        state.currentSura = audioData.audio_files.map((file) => ({
          id: file.chapter_id,
          chapter_id: file.chapter_id,
          audio_url: file.audio_url,
          file_size: file.file_size,
        }));
      }

      if (typeof i === 'number') {
        state.currentIndex = i;
      }

      if (reciter) {
        state.currentReciter = reciter;
      }

      state.isActive = true;
      state.isPlaying = true;

      if (state.activeSura) {
        const surahId = Number(state.activeSura.chapter_id || state.activeSura.id);
        const reciterId = Number(state.currentReciter?.id || DEFAULT_RECITER.id);

        const recentItem: RecentRecitation = {
          surahId,
          surahName: state.activeSura.name_simple || state.activeSura.name || `Surah ${surahId}`,
          arabicName: state.activeSura.name_arabic || '',
          reciterId,
          reciterName: state.currentReciter?.reciter_name || DEFAULT_RECITER.reciter_name,
        };
        state.recents = addRecentToState(state.recents, recentItem);

        state.lastSession = {
          activeSura: state.activeSura,
          currentReciter: state.currentReciter,
          progressSeconds: 0,
        };
      }
    },

    setReciter: (state, action: PayloadAction<Reciter>) => {
      state.currentReciter = action.payload;
      if (state.activeSura) {
        state.lastSession = {
          activeSura: state.activeSura,
          currentReciter: action.payload,
          progressSeconds: state.lastSession?.progressSeconds || 0,
        };
      }
    },

    nextSura: (state, action: PayloadAction<number | undefined>) => {
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

      if (state.activeSura) {
        const surahId = Number(state.activeSura.chapter_id || state.activeSura.id);
        const reciterId = Number(state.currentReciter?.id || DEFAULT_RECITER.id);

        const recentItem: RecentRecitation = {
          surahId,
          surahName: state.activeSura.name_simple || state.activeSura.name || `Surah ${surahId}`,
          arabicName: state.activeSura.name_arabic || '',
          reciterId,
          reciterName: state.currentReciter?.reciter_name || DEFAULT_RECITER.reciter_name,
        };
        state.recents = addRecentToState(state.recents, recentItem);
      }
    },

    prevSura: (state, action: PayloadAction<number | undefined>) => {
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

    playPause: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    setRepeatMode: (state, action: PayloadAction<RepeatMode>) => {
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

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Number(action.payload);
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      const speed = Number(action.payload);
      if (speed >= 0.75 && speed <= 1.25) {
        state.playbackSpeed = speed;
      }
    },

    setSeekTime: (state, action: PayloadAction<number>) => {
      state.seekTime = action.payload;
      state.seekCount = (state.seekCount || 0) + 1;
    },

    savePlaybackProgress: (state, action: PayloadAction<number>) => {
      const seconds = Number(action.payload);
      if (state.activeSura) {
        state.lastSession = {
          activeSura: state.activeSura,
          currentReciter: state.currentReciter,
          progressSeconds: Math.floor(seconds),
        };
      }
    },

    setIsExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },

    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },

    // Favorites (Surah IDs)
    toggleFavoriteSurah: (state, action: PayloadAction<number | string>) => {
      const id = Number(action.payload);
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((fav) => fav !== id);
      } else {
        state.favorites.push(id);
      }
    },

    // Favorite Reciters (Reciter IDs)
    toggleFavoriteReciter: (state, action: PayloadAction<number | string>) => {
      const id = Number(action.payload);
      if (state.favoriteReciters.includes(id)) {
        state.favoriteReciters = state.favoriteReciters.filter((fav) => fav !== id);
      } else {
        state.favoriteReciters.push(id);
      }
    },

    // Sleep Timer
    setSleepTimer: (state, action: PayloadAction<SetSleepTimerPayload>) => {
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
    setHifzMode: (state, action: PayloadAction<Partial<HifzModeState>>) => {
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
  toggleFavoriteSurah,
  toggleFavoriteReciter,
  setSleepTimer,
  decrementSleepTimer,
  triggerSurahSleepStop,
  clearSleepTimer,
  setHifzMode,
  incrementHifzLoop,
} = playerSlice.actions;

// --- Granular Selectors ---
export const selectActiveSura = (state: { player: PlayerState }) => state.player.activeSura;
export const selectIsPlaying = (state: { player: PlayerState }) => state.player.isPlaying;
export const selectIsActive = (state: { player: PlayerState }) => state.player.isActive;
export const selectCurrentReciter = (state: { player: PlayerState }) => state.player.currentReciter;
export const selectRepeatMode = (state: { player: PlayerState }) => state.player.repeatMode;
export const selectShuffle = (state: { player: PlayerState }) => state.player.shuffle;
export const selectVolume = (state: { player: PlayerState }) => state.player.volume;
export const selectPlaybackSpeed = (state: { player: PlayerState }) => state.player.playbackSpeed;
export const selectSeekTime = (state: { player: PlayerState }) => state.player.seekTime;
export const selectSeekCount = (state: { player: PlayerState }) => state.player.seekCount;
export const selectIsExpanded = (state: { player: PlayerState }) => state.player.isExpanded;
export const selectSleepTimer = (state: { player: PlayerState }) => state.player.sleepTimer;
export const selectHifzMode = (state: { player: PlayerState }) => state.player.hifzMode;
export const selectFavorites = (state: { player: PlayerState }) => state.player.favorites;
export const selectFavoriteReciters = (state: { player: PlayerState }) => state.player.favoriteReciters;
export const selectRecents = (state: { player: PlayerState }) => state.player.recents;
export const selectLastSession = (state: { player: PlayerState }) => state.player.lastSession;
export const selectCurrentSura = (state: { player: PlayerState }) => state.player.currentSura;
export const selectCurrentIndex = (state: { player: PlayerState }) => state.player.currentIndex;

export const selectIsFavoriteSurah = (surahId: number | string) => (state: { player: PlayerState }) =>
  state.player.favorites.includes(Number(surahId));

export const selectIsFavoriteReciter = (reciterId: number | string) => (state: { player: PlayerState }) =>
  state.player.favoriteReciters.includes(Number(reciterId));

export default playerSlice.reducer;
