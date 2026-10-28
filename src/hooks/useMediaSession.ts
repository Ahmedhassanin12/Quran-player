import { useEffect } from 'react';
import type { Surah } from '../types/quran';
import type { Reciter } from '../types/reciter';

export interface UseMediaSessionProps {
  activeSura: Surah | null;
  currentReciter: Reciter | null;
  isPlaying: boolean;
  duration: number;
  appTime: number;
  playbackSpeed?: number;
  handlePlayPause?: (playing: boolean) => void;
  handlePrevSong?: () => void;
  handleNextSong?: () => void;
  handleSeekRelative?: (secondsDelta: number) => void;
  setSeekTime?: (time: number) => void;
}

export const useMediaSession = ({
  activeSura,
  currentReciter,
  isPlaying,
  duration,
  appTime,
  playbackSpeed = 1.0,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  handleSeekRelative,
  setSeekTime,
}: UseMediaSessionProps): void => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !activeSura) {
      return undefined;
    }

    const surahTitle = activeSura.name_simple || activeSura.name || `Surah ${activeSura.chapter_id || activeSura.id}`;
    const arabicTitle = activeSura.name_arabic ? ` - ${activeSura.name_arabic}` : '';
    const reciterName = currentReciter?.reciter_name || 'Holy Quran Recitation';

    // Set metadata for OS lockscreen and notifications
    if (typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${surahTitle}${arabicTitle}`,
        artist: reciterName,
        album: `Holy Quran • Chapter ${activeSura.chapter_id || activeSura.id}`,
        artwork: [
          {
            src: currentReciter?.photo_url || '/favicon.ico',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });
    }

    // Register OS media action handlers
    const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => handlePlayPause?.(true)],
      ['pause', () => handlePlayPause?.(false)],
      ['previoustrack', () => handlePrevSong?.()],
      ['nexttrack', () => handleNextSong?.()],
      ['seekbackward', () => handleSeekRelative?.(-10)],
      ['seekforward', () => handleSeekRelative?.(10)],
      [
        'seekto',
        (details: MediaSessionActionDetails) => {
          if (details.seekTime !== undefined && typeof setSeekTime === 'function') {
            setSeekTime(details.seekTime);
          }
        },
      ],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (_) {
        // unsupported action in this browser
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (_) {
          // ignore
        }
      });
    };
  }, [
    activeSura,
    currentReciter,
    handlePlayPause,
    handlePrevSong,
    handleNextSong,
    handleSeekRelative,
    setSeekTime,
  ]);

  // Update playback state
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Update position state for scrubbing
  useEffect(() => {
    const isSupported = typeof window !== 'undefined'
      && 'mediaSession' in navigator
      && 'setPositionState' in navigator.mediaSession;

    if (isSupported && duration > 0 && typeof appTime === 'number') {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: playbackSpeed,
          position: Math.max(0, Math.min(duration, appTime)),
        });
      } catch (_) {
        // ignore occasional microsecond sync mismatch
      }
    }
  }, [duration, appTime, playbackSpeed]);
};

export default useMediaSession;
