import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  nextSura,
  prevSura,
  playPause,
  cycleRepeatMode,
  toggleShuffle,
  setVolume as setReduxVolume,
} from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';
import ExpandedPlayer from './ExpandedPlayer';

const QuranPlayer = () => {
  const dispatch = useDispatch();
  const {
    activeSura,
    currentSura,
    currentIndex,
    isActive,
    isPlaying,
    currentReciter,
    repeatMode,
    shuffle,
    volume: storedVolume,
  } = useSelector((state) => state.player);

  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(null);
  const [appTime, setAppTime] = useState(0);
  const [localVolume, setLocalVolume] = useState(storedVolume || 0.8);

  const handlePlayPause = useCallback(() => {
    if (!isActive) return;
    dispatch(playPause(!isPlaying));
  }, [isActive, isPlaying, dispatch]);

  const handleNextSong = useCallback(() => {
    if (!currentSura || currentSura.length === 0) return;

    if (repeatMode === 'one') {
      // Repeat current track: reset to 0 and ensure play
      setSeekTime(0);
      setAppTime(0);
      dispatch(playPause(true));
      return;
    }

    if (shuffle) {
      const randomIdx = Math.floor(Math.random() * currentSura.length);
      dispatch(nextSura(randomIdx));
    } else {
      dispatch(nextSura());
    }
  }, [currentSura, repeatMode, shuffle, dispatch]);

  const handlePrevSong = useCallback(() => {
    if (!currentSura || currentSura.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (appTime > 3) {
      setSeekTime(0);
      setAppTime(0);
      return;
    }

    if (shuffle) {
      const randomIdx = Math.floor(Math.random() * currentSura.length);
      dispatch(prevSura(randomIdx));
    } else {
      dispatch(prevSura());
    }
  }, [currentSura, appTime, shuffle, dispatch]);

  const handleSeekRelative = useCallback((seconds) => {
    setAppTime((prev) => {
      const newTime = Math.max(0, Math.min(duration || 0, prev + seconds));
      setSeekTime(newTime);
      return newTime;
    });
  }, [duration]);

  const handleSeekInput = (event) => {
    const newTime = Number(event.target.value);
    setAppTime(newTime);
    setSeekTime(newTime);
  };

  const handleVolumeChange = (newVal) => {
    setLocalVolume(newVal);
    dispatch(setReduxVolume(newVal));
  };

  // Keyboard media keys / shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  if (!isActive || !activeSura) return null;

  return (
    <>
      {/* Persistent Bottom Bar Player */}
      <footer
        className="fixed bottom-0 left-0 right-0 h-24 sm:h-28 z-40 bg-charcoal-900/95 backdrop-blur-xl border-t border-charcoal-700/80 px-4 sm:px-8 flex items-center justify-between shadow-2xl transition-all"
        role="region"
        aria-label="Audio Player"
      >
        {/* Active Surah Track Information */}
        <Track
          isPlaying={isPlaying}
          isActive={isActive}
          activeSura={activeSura}
          currentReciter={currentReciter}
        />

        {/* Center Controls & Progress Timeline */}
        <div className="flex-1 max-w-xl mx-4 flex flex-col items-center justify-center space-y-1">
          <Controls
            isPlaying={isPlaying}
            isActive={isActive}
            repeatMode={repeatMode}
            cycleRepeatMode={() => dispatch(cycleRepeatMode())}
            shuffle={shuffle}
            toggleShuffle={() => dispatch(toggleShuffle())}
            handlePlayPause={handlePlayPause}
            handlePrevSong={handlePrevSong}
            handleNextSong={handleNextSong}
            handleSeekRelative={handleSeekRelative}
          />

          <Seekbar
            appTime={appTime}
            min={0}
            max={duration}
            onInput={handleSeekInput}
          />

          <Player
            activeSura={activeSura}
            volume={localVolume}
            isPlaying={isPlaying}
            seekTime={seekTime}
            repeat={repeatMode === 'one'}
            onEnded={handleNextSong}
            onTimeUpdate={(e) => setAppTime(e.target.currentTime)}
            onLoadedData={(e) => setDuration(e.target.duration)}
          />
        </div>

        {/* Right Volume Bar */}
        <VolumeBar
          value={localVolume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          setVolume={handleVolumeChange}
        />
      </footer>

      {/* Expanded Player Overlay Modal */}
      <ExpandedPlayer
        appTime={appTime}
        duration={duration}
        onSeek={handleSeekInput}
        volume={localVolume}
        onVolumeChange={handleVolumeChange}
        handleNextSong={handleNextSong}
        handlePrevSong={handlePrevSong}
        handleSeekRelative={handleSeekRelative}
      />
    </>
  );
};

export default QuranPlayer;
