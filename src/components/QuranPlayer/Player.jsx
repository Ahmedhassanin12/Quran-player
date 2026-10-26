/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { downloadService } from '../../services/downloadService';

const Player = ({
  activeSura,
  isPlaying,
  volume,
  playbackSpeed = 1.0,
  seekTime,
  seekCount = 0,
  repeat,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  onDurationChange,
  onError,
}) => {
  const ref = useRef(null);
  const pendingSeekRef = useRef(null);
  const blobUrlRef = useRef(null);
  const { currentReciter } = useSelector((state) => state.player);
  const [resolvedSrc, setResolvedSrc] = useState(activeSura?.audio_url || '');

  const surahId = Number(activeSura?.chapter_id || activeSura?.id || 0);
  const reciterId = Number(
    activeSura?.reciter_id || currentReciter?.id || 0,
  );

  // Prefer offline IndexedDB blob when available; fall back to remote CDN URL
  useEffect(() => {
    let cancelled = false;

    const resolveSource = async () => {
      const remoteUrl = activeSura?.audio_url || '';

      if (!surahId || !reciterId) {
        if (blobUrlRef.current) {
          downloadService.revokeObjectUrl(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        if (!cancelled) setResolvedSrc(remoteUrl);
        return;
      }

      try {
        const offlineUrl = await downloadService.getObjectUrl(reciterId, surahId);
        if (cancelled) {
          downloadService.revokeObjectUrl(offlineUrl);
          return;
        }

        if (blobUrlRef.current && blobUrlRef.current !== offlineUrl) {
          downloadService.revokeObjectUrl(blobUrlRef.current);
        }

        if (offlineUrl) {
          blobUrlRef.current = offlineUrl;
          setResolvedSrc(offlineUrl);
        } else {
          blobUrlRef.current = null;
          setResolvedSrc(remoteUrl);
        }
      } catch (_) {
        if (!cancelled) {
          if (blobUrlRef.current) {
            downloadService.revokeObjectUrl(blobUrlRef.current);
            blobUrlRef.current = null;
          }
          setResolvedSrc(remoteUrl);
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
  }, []);

  // Safely manage playback state
  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

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
    if (!audio || typeof seekTime !== 'number' || isNaN(seekTime)) return;

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

  const handleLoadedData = (e) => {
    const audio = e.target;

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
      } catch (_) {}
      pendingSeekRef.current = null;
    }

    if (onDurationChange) {
      onDurationChange(e);
    }
    if (onLoadedData) {
      onLoadedData(e);
    }
  };

  const handleInternalTimeUpdate = (e) => {
    if (onTimeUpdate) {
      onTimeUpdate(e);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('quran-audio-time', {
          detail: { currentTime: e.target.currentTime },
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
      onError={onError}
      playsInline
      preload="auto"
    />
  );
};

export default Player;
