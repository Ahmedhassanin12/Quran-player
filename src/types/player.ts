import type { Reciter } from './reciter';
import type { Surah } from './quran';

export type RepeatMode = 'off' | 'all' | 'one';

export type SleepTimerMode = 'surah' | '15' | '30' | '45' | '60' | null;

export interface SleepTimerState {
  active: boolean;
  mode: SleepTimerMode;
  remainingSeconds: number;
  isFadingOut: boolean;
}

export interface HifzModeState {
  active: boolean;
  startVerse: number;
  endVerse: number;
  targetLoops: number;
  currentLoop: number;
}

export interface RecentRecitation {
  surahId: number;
  surahName: string;
  arabicName: string;
  reciterId: number;
  reciterName: string;
  playedAt?: string;
}

export interface LastSession {
  activeSura: Surah;
  currentReciter: Reciter;
  progressSeconds: number;
}

export interface UserSettings {
  volume: number;
  speed: number;
}

export interface PlayerState {
  currentSura: Surah[];
  currentIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  activeSura: Surah | null;
  currentReciter: Reciter;
  repeatMode: RepeatMode;
  shuffle: boolean;
  isExpanded: boolean;
  volume: number;
  playbackSpeed: number;
  seekTime: number;
  seekCount: number;
  genreListId: string;
  favorites: number[];
  favoriteReciters: number[];
  recents: RecentRecitation[];
  lastSession: LastSession | null;
  sleepTimer: SleepTimerState;
  hifzMode: HifzModeState;
}
