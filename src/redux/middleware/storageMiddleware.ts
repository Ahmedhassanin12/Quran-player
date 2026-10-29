import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { storageService } from '../../services/storageService';
import {
  setActiveSura,
  setReciter,
  nextSura,
  setVolume,
  setPlaybackSpeed,
  savePlaybackProgress,
  toggleFavoriteSurah,
  toggleFavoriteReciter,
} from '../features/playerSlice';
import type { RootState } from '../store';

export const storageMiddleware = createListenerMiddleware();

// 1. Settings persistence (volume & speed)
storageMiddleware.startListening({
  matcher: isAnyOf(setVolume, setPlaybackSpeed),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    storageService.saveSettings({
      volume: state.player.volume,
      speed: state.player.playbackSpeed,
    });
  },
});

// 2. Last session persistence (active surah, reciter, progress)
storageMiddleware.startListening({
  matcher: isAnyOf(setActiveSura, setReciter, savePlaybackProgress),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    if (state.player.lastSession) {
      storageService.saveLastSession(state.player.lastSession);
    }
  },
});

// 3. Recently played recitations persistence
storageMiddleware.startListening({
  matcher: isAnyOf(setActiveSura, nextSura),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    storageService.saveRecents(state.player.recents);
  },
});

// 4. Favorites persistence
storageMiddleware.startListening({
  actionCreator: toggleFavoriteSurah,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    storageService.saveFavorites(state.player.favorites);
  },
});

// 5. Favorite reciters persistence
storageMiddleware.startListening({
  actionCreator: toggleFavoriteReciter,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    storageService.saveFavoriteReciters(state.player.favoriteReciters);
  },
});
