/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from 'react';

const Player = ({
  activeSura,
  isPlaying,
  volume,
  seekTime,
  repeat,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  onError,
}) => {
  const ref = useRef(null);

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

  // Manage seeking
  useEffect(() => {
    if (ref.current && typeof seekTime === 'number') {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  return (
    <audio
      ref={ref}
      src={activeSura?.audio_url}
      loop={repeat}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      onLoadedData={onLoadedData}
      onError={onError}
      preload="auto"
    />
  );
};

export default Player;
