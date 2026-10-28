// Safe, typed local storage persistence service for Quran Kareem Player
import type { LastSession, UserSettings, RecentRecitation } from '../types/player';
import type { MushafBookmark } from '../types/mushaf';

const STORAGE_KEYS = {
  LAST_SESSION: 'quran_player_last_session',
  FAVORITES: 'quran_player_favorites',
  FAVORITE_RECITERS: 'quran_player_favorite_reciters',
  RECENTS: 'quran_player_recents',
  SETTINGS: 'quran_player_settings',
  MUSHAF_PAGE: 'quran_player_last_mushaf_page',
  MUSHAF_BOOKMARKS: 'quran_player_mushaf_bookmarks',
  VIEW_MODE: 'quran_player_view_mode',
} as const;

const safeGet = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to read from localStorage key "${key}":`, err);
    return fallback;
  }
};

const safeSet = <T>(key: string, value: T): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to write to localStorage key "${key}":`, err);
  }
};

export const storageService = {
  // View mode (grid | list) across Surah Library and Downloads
  getViewMode: (): 'grid' | 'list' => safeGet<'grid' | 'list'>(STORAGE_KEYS.VIEW_MODE, 'grid'),
  saveViewMode: (mode: 'grid' | 'list' | string): void => {
    safeSet(STORAGE_KEYS.VIEW_MODE, mode === 'list' ? 'list' : 'grid');
  },

  // Last session (for Continue Listening)
  getLastSession: (): LastSession | null => safeGet<LastSession | null>(STORAGE_KEYS.LAST_SESSION, null),
  saveLastSession: (session: LastSession | null): void => {
    safeSet(STORAGE_KEYS.LAST_SESSION, session);
  },

  // Favorites (Surah IDs)
  getFavorites: (): number[] => safeGet<number[]>(STORAGE_KEYS.FAVORITES, []),
  saveFavorites: (favorites: number[]): void => {
    safeSet(STORAGE_KEYS.FAVORITES, favorites);
  },
  toggleFavorite: (surahId: number | string): number[] => {
    const list = safeGet<number[]>(STORAGE_KEYS.FAVORITES, []);
    const id = Number(surahId);
    const updated = list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id];
    safeSet(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  },

  // Favorite Reciters (Reciter IDs)
  getFavoriteReciters: (): number[] => safeGet<number[]>(STORAGE_KEYS.FAVORITE_RECITERS, []),
  toggleFavoriteReciter: (reciterId: number | string): number[] => {
    const list = safeGet<number[]>(STORAGE_KEYS.FAVORITE_RECITERS, []);
    const id = Number(reciterId);
    const updated = list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id];
    safeSet(STORAGE_KEYS.FAVORITE_RECITERS, updated);
    return updated;
  },

  // Recently played history (max 20 recitations)
  getRecents: (): RecentRecitation[] => safeGet<RecentRecitation[]>(STORAGE_KEYS.RECENTS, []),
  addRecent: (recentItem: RecentRecitation): RecentRecitation[] => {
    const list = safeGet<RecentRecitation[]>(STORAGE_KEYS.RECENTS, []);
    // deduplicate by surahId & reciterId
    const filtered = list.filter(
      (item) => !(item.surahId === recentItem.surahId && item.reciterId === recentItem.reciterId),
    );
    const updated: RecentRecitation[] = [
      {
        ...recentItem,
        playedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, 20); // Keep last 20
    safeSet(STORAGE_KEYS.RECENTS, updated);
    return updated;
  },

  // User playback settings (volume, speed)
  getSettings: (): UserSettings => safeGet<UserSettings>(STORAGE_KEYS.SETTINGS, { volume: 0.8, speed: 1.0 }),
  saveSettings: (settings: Partial<UserSettings>): void => {
    const current = storageService.getSettings();
    safeSet(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  },

  // Authentic Madinah Mushaf position persistence
  getLastMushafPage: (): number => Number(safeGet(STORAGE_KEYS.MUSHAF_PAGE, 1)) || 1,
  saveLastMushafPage: (pageNumber: number | string): void => {
    safeSet(
      STORAGE_KEYS.MUSHAF_PAGE,
      Math.max(1, Math.min(604, Number(pageNumber) || 1)),
    );
  },

  // Mushaf Ayah Bookmarks
  getMushafBookmarks: (): MushafBookmark[] => safeGet<MushafBookmark[]>(STORAGE_KEYS.MUSHAF_BOOKMARKS, []),
  toggleMushafBookmark: (bookmarkItem: Partial<MushafBookmark> & { verseKey: string }): MushafBookmark[] => {
    const list = safeGet<MushafBookmark[]>(STORAGE_KEYS.MUSHAF_BOOKMARKS, []);
    const exists = list.some((b) => b.verseKey === bookmarkItem.verseKey);
    const updated: MushafBookmark[] = exists
      ? list.filter((b) => b.verseKey !== bookmarkItem.verseKey)
      : [
        {
          surahNumber: bookmarkItem.surahNumber || Number(bookmarkItem.verseKey.split(':')[0]) || 1,
          ayahNumber: bookmarkItem.ayahNumber || Number(bookmarkItem.verseKey.split(':')[1]) || 1,
          surahName: bookmarkItem.surahName || `Surah ${bookmarkItem.verseKey.split(':')[0]}`,
          arabicName: bookmarkItem.arabicName || '',
          pageNumber: bookmarkItem.pageNumber || 1,
          createdAt: new Date().toISOString(),
          ...bookmarkItem,
          verseKey: bookmarkItem.verseKey,
        },
        ...list,
      ];
    safeSet(STORAGE_KEYS.MUSHAF_BOOKMARKS, updated);
    return updated;
  },
  isVerseBookmarked: (verseKey: string): boolean => {
    const list = safeGet<MushafBookmark[]>(STORAGE_KEYS.MUSHAF_BOOKMARKS, []);
    return list.some((b) => b.verseKey === verseKey);
  },
};

export default storageService;
