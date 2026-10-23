// Safe, typed local storage persistence service for Quran Kareem Player

const STORAGE_KEYS = {
  LAST_SESSION: 'quran_player_last_session',
  FAVORITES: 'quran_player_favorites',
  FAVORITE_RECITERS: 'quran_player_favorite_reciters',
  RECENTS: 'quran_player_recents',
  SETTINGS: 'quran_player_settings',
};

const safeGet = (key, fallback = null) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to read from localStorage key "${key}":`, err);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to write to localStorage key "${key}":`, err);
  }
};

export const storageService = {
  // Last session (for Continue Listening)
  getLastSession: () => safeGet(STORAGE_KEYS.LAST_SESSION, null),
  saveLastSession: (session) => safeSet(STORAGE_KEYS.LAST_SESSION, session),

  // Favorites (Surah IDs)
  getFavorites: () => safeGet(STORAGE_KEYS.FAVORITES, []),
  saveFavorites: (favorites) => safeSet(STORAGE_KEYS.FAVORITES, favorites),
  toggleFavorite: (surahId) => {
    const list = safeGet(STORAGE_KEYS.FAVORITES, []);
    const id = Number(surahId);
    const updated = list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id];
    safeSet(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  },

  // Favorite Reciters (Reciter IDs)
  getFavoriteReciters: () => safeGet(STORAGE_KEYS.FAVORITE_RECITERS, []),
  toggleFavoriteReciter: (reciterId) => {
    const list = safeGet(STORAGE_KEYS.FAVORITE_RECITERS, []);
    const id = Number(reciterId);
    const updated = list.includes(id)
      ? list.filter((item) => item !== id)
      : [...list, id];
    safeSet(STORAGE_KEYS.FAVORITE_RECITERS, updated);
    return updated;
  },

  // Recently played history (max 20 recitations)
  getRecents: () => safeGet(STORAGE_KEYS.RECENTS, []),
  addRecent: (recentItem) => {
    const list = safeGet(STORAGE_KEYS.RECENTS, []);
    // deduplicate by surahId & reciterId
    const filtered = list.filter(
      (item) => !(item.surahId === recentItem.surahId && item.reciterId === recentItem.reciterId),
    );
    const updated = [
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
  getSettings: () => safeGet(STORAGE_KEYS.SETTINGS, { volume: 0.8, speed: 1.0 }),
  saveSettings: (settings) => safeSet(STORAGE_KEYS.SETTINGS, settings),
};

export default storageService;
