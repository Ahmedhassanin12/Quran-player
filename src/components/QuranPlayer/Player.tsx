/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentReciter } from '../../redux/features/playerSlice';
import { downloadService } from '../../services/downloadService';
import { getSurahId, getEffectiveReciterId } from '../../utils/quranUtils';
import type { Surah } from '../../types/quran';

export interface PlayerProps {
  activeSura?: Surah | null;
  isPlaying?: boolean;
  volume: number;
  playbackSpeed?: number;
  seekTime?: number | null;
  seekCount?: number;
  repeat?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  onLoadedData?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  onDurationChange?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
}

const Player: React.FC<PlayerProps> = ({
  activeSura,
  isPlaying = false,
  volume,
  playbackSpeed = 1.0,
  seekTime,
  seekCount = 0,
  repeat = false,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  onDurationChange,
  onError,
}) => {
  const ref = useRef<HTMLAudioElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const pendingRevokeUrlRef = useRef<string | null>(null);
  const currentReciter = useAppSelector(selectCurrentReciter);
  // Start with empty string to prevent premature remote requests and onError when offline
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  const surahId = getSurahId(activeSura);
  const reciterId = getEffectiveReciterId(activeSura, currentReciter);

  // Prefer offline IndexedDB blob when available; fall back to remote CDN URL if online
  useEffect(() => {
    let cancelled = false;

    const resolveSource = async () => {
      const remoteUrl = activeSura?.audio_url || '';
      const isOnline = typeof navigator === 'undefined' || navigator.onLine;

      if (!surahId || !reciterId) {
        if (blobUrlRef.current) {
          const oldUrl = blobUrlRef.current;
          blobUrlRef.current = null;
          downloadService.revokeObjectUrl(oldUrl);
        }
        if (!cancelled) setResolvedSrc(isOnline ? remoteUrl : '');
        return;
      }

      try {
        const offlineUrl = await downloadService.getObjectUrl(reciterId, surahId);
        if (cancelled) {
          downloadService.revokeObjectUrl(offlineUrl);
          return;
        }

        const prevBlobUrl = blobUrlRef.current;
        if (offlineUrl) {
          blobUrlRef.current = offlineUrl;
          setResolvedSrc(offlineUrl);
        } else {
          blobUrlRef.current = null;
          setResolvedSrc(isOnline ? remoteUrl : '');
        }

        // Clean up previous blob URL via event-driven hook with safety timeout fallback
        if (prevBlobUrl && prevBlobUrl !== offlineUrl) {
          pendingRevokeUrlRef.current = prevBlobUrl;
          setTimeout(() => {
            if (pendingRevokeUrlRef.current === prevBlobUrl) {
              downloadService.revokeObjectUrl(prevBlobUrl);
              pendingRevokeUrlRef.current = null;
            }
          }, 500);
        }
      } catch (_) {
        if (!cancelled) {
          const prevBlobUrl = blobUrlRef.current;
          blobUrlRef.current = null;
          if (prevBlobUrl) {
            pendingRevokeUrlRef.current = prevBlobUrl;
            setTimeout(() => {
              if (pendingRevokeUrlRef.current === prevBlobUrl) {
                downloadService.revokeObjectUrl(prevBlobUrl);
                pendingRevokeUrlRef.current = null;
              }
            }, 500);
          }
          setResolvedSrc(isOnline ? remoteUrl : '');
        }
      }
    };

    resolveSource();

    return () => {
      cancelled = true;
    };
  }, [surahId, reciterId, activeSura?.audio_url]);

  useEffect(() => () => {
    if (blobUrlRef.current) {
      downloadService.revokeObjectUrl(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (pendingRevokeUrlRef.current) {
      downloadService.revokeObjectUrl(pendingRevokeUrlRef.current);
      pendingRevokeUrlRef.current = null;
    }
  }, []);

  // Safely manage playback state
  useEffect(() => {
    const audio = ref.current;
    if (!audio || !resolvedSrc) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Play was interrupted or disallowed by browser autoplay policy
          // eslint-disable-next-line no-console
          console.warn('Playback was prevented or interrupted:', error);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, resolvedSrc]);

  // Manage volume
  useEffect(() => {
    if (ref.current) {
      ref.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  // Manage playback speed with pitch preservation
  useEffect(() => {
    if (ref.current) {
      ref.current.preservesPitch = true;
      ref.current.playbackRate = Math.max(0.75, Math.min(1.25, playbackSpeed));
    }
  }, [playbackSpeed]);

  // Manage seeking (handles both immediate seeking and queued seeking for loading tracks)
  useEffect(() => {
    const audio = ref.current;
    if (!audio || typeof seekTime !== 'number' || Number.isNaN(seekTime)) return;

    if (audio.readyState >= 1) {
      try {
        audio.currentTime = seekTime;
        pendingSeekRef.current = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('quran-audio-time', {
              detail: { currentTime: seekTime },
            }),
          );
        }
      } catch (_) {
        pendingSeekRef.current = seekTime;
      }
    } else {
      // Audio is still loading source, queue seekTime for when metadata loads
      pendingSeekRef.current = seekTime;
    }
  }, [seekTime, seekCount, resolvedSrc]);

  const handleLoadedData = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;

    // Safely revoke any pending previous blob URL now that the new audio source has loaded
    if (pendingRevokeUrlRef.current) {
      downloadService.revokeObjectUrl(pendingRevokeUrlRef.current);
      pendingRevokeUrlRef.current = null;
    }

    // Apply any queued seek position (e.g. from handleJumpToVerse when starting new surah)
    if (pendingSeekRef.current !== null && typeof pendingSeekRef.current === 'number') {
      try {
        audio.currentTime = pendingSeekRef.current;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('quran-audio-time', {
              detail: { currentTime: pendingSeekRef.current },
            }),
          );
        }
      } catch (_) {
        // ignore seek error
      }
      pendingSeekRef.current = null;
    }

    if (onDurationChange) {
      onDurationChange(e);
    }
    if (onLoadedData) {
      onLoadedData(e);
    }
  };

  const handleInternalTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (onTimeUpdate) {
      onTimeUpdate(e);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('quran-audio-time', {
          detail: { currentTime: e.currentTarget.currentTime },
        }),
      );
    }
  };

  return (
    <audio
      ref={ref}
      src={resolvedSrc || undefined}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={handleInternalTimeUpdate}
      onLoadedMetadata={handleLoadedData}
      onLoadedData={handleLoadedData}
      onDurationChange={(e) => {
        if (onDurationChange) onDurationChange(e);
        else if (onLoadedData) onLoadedData(e);
      }}
      onCanPlay={handleLoadedData}
      onError={(e) => {
        if (onError && resolvedSrc) onError(e);
      }}
      preload="auto"
    />
  );
};

export default Player;
