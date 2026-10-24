/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from 'react';

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
  onError,
}) => {
  const ref = useRef(null);
  const pendingSeekRef = useRef(null);

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
  }, [isPlaying, activeSura?.audio_url]);

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
  }, [seekTime, seekCount, activeSura?.audio_url]);

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
      src={activeSura?.audio_url}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={handleInternalTimeUpdate}
      onLoadedData={handleLoadedData}
      onCanPlay={handleLoadedData}
      onError={onError}
      preload="auto"
    />
  );
};

export default Player;
