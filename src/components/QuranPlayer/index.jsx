import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiMaximize2 } from 'react-icons/fi';

import {
  nextSura,
  prevSura,
  playPause,
  cycleRepeatMode,
  toggleShuffle,
  setVolume as setReduxVolume,
  setIsExpanded,
  decrementSleepTimer,
  triggerSurahSleepStop,
  savePlaybackProgress,
} from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';
import ExpandedPlayer from './ExpandedPlayer';
import SleepTimerModal from './SleepTimerModal';
import SpeedSelectorModal from './SpeedSelectorModal';
import { useMediaSession } from '../../hooks/useMediaSession';

const QuranPlayer = () => {
  const dispatch = useDispatch();
  const {
    activeSura,
    currentSura,
    isActive,
    isPlaying,
    currentReciter,
    repeatMode,
    shuffle,
    volume: storedVolume,
    playbackSpeed,
    sleepTimer,
  } = useSelector((state) => state.player);

  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(null);
  const [appTime, setAppTime] = useState(0);
  const [localVolume, setLocalVolume] = useState(storedVolume || 0.8);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);

  const handlePlayPause = useCallback((forcedState) => {
    if (!isActive) return;
    const nextState = typeof forcedState === 'boolean' ? forcedState : !isPlaying;
    dispatch(playPause(nextState));
  }, [isActive, isPlaying, dispatch]);

  const handleNextSong = useCallback(() => {
    if (!currentSura || currentSura.length === 0) return;

    if (repeatMode === 'one') {
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

  const handleTrackEnded = useCallback(() => {
    if (sleepTimer?.active && sleepTimer.mode === 'surah') {
      dispatch(triggerSurahSleepStop());
      return;
    }
    handleNextSong();
  }, [sleepTimer, dispatch, handleNextSong]);

  // Hook into MediaSession API (Lockscreen, Car, Bluetooth, AirPods)
  useMediaSession({
    activeSura,
    currentReciter,
    isPlaying,
    duration,
    appTime,
    playbackSpeed,
    handlePlayPause,
    handlePrevSong,
    handleNextSong,
    handleSeekRelative,
    setSeekTime,
  });

  // Sleep timer interval countdown
  useEffect(() => {
    if (!sleepTimer?.active || sleepTimer.mode === 'surah') return;

    const interval = setInterval(() => {
      dispatch(decrementSleepTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer?.active, sleepTimer?.mode, dispatch]);

  // Sleep timer 30s smooth volume fadeout
  useEffect(() => {
    if (!sleepTimer?.active || sleepTimer.mode === 'surah') return;

    if (sleepTimer.isFadingOut && sleepTimer.remainingSeconds <= 30) {
      const factor = Math.max(0, sleepTimer.remainingSeconds / 30);
      setLocalVolume(storedVolume * factor);
    } else if (!sleepTimer.isFadingOut && localVolume !== storedVolume) {
      setLocalVolume(storedVolume);
    }
  }, [sleepTimer?.active, sleepTimer?.isFadingOut, sleepTimer?.remainingSeconds, storedVolume]);

  // Periodically throttle saving playback position for "Continue Listening"
  useEffect(() => {
    if (!isPlaying || !activeSura || appTime <= 0) return;

    const timer = setTimeout(() => {
      dispatch(savePlaybackProgress(appTime));
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPlaying, activeSura, appTime, dispatch]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        handleSeekRelative(10);
      } else if (e.code === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        handleSeekRelative(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleSeekRelative]);

  if (!isActive || !activeSura) return null;

  const formatTimerBadge = () => {
    if (!sleepTimer.active) return null;
    if (sleepTimer.mode === 'surah') return 'Surah';
    const mins = Math.ceil(sleepTimer.remainingSeconds / 60);
    return `${mins}m`;
  };

  return (
    <>
      {/* Persistent Bottom Bar Player */}
      <footer
        className="w-full shrink-0 relative bg-midnight-900/98 backdrop-blur-xl border-t border-midnight-700/80 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-0 min-h-[4.75rem] sm:h-24 flex items-center justify-between z-30 shadow-2xl transition-all pb-[env(safe-area-inset-bottom,0px)]"
        role="region"
        aria-label="Audio Player"
      >
        {/* Sleek Top Edge Mini Progress Bar (Continuous visual feedback) */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-midnight-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-[width] duration-150"
            style={{ width: `${duration > 0 ? (appTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Left: Active Surah Track Information */}
        <Track
          isPlaying={isPlaying}
          isActive={isActive}
          activeSura={activeSura}
          currentReciter={currentReciter}
        />

        {/* Center: Controls & Progress Timeline */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4 flex flex-col items-center justify-center space-y-0.5 sm:space-y-1">
          <Controls
            isPlaying={isPlaying}
            isActive={isActive}
            repeatMode={repeatMode}
            cycleRepeatMode={() => dispatch(cycleRepeatMode())}
            shuffle={shuffle}
            toggleShuffle={() => dispatch(toggleShuffle())}
            handlePlayPause={() => handlePlayPause()}
            handlePrevSong={handlePrevSong}
            handleNextSong={handleNextSong}
            handleSeekRelative={handleSeekRelative}
          />

          <div className="w-full hidden sm:block">
            <Seekbar
              appTime={appTime}
              min={0}
              max={duration}
              onInput={handleSeekInput}
            />
          </div>

          <Player
            activeSura={activeSura}
            volume={localVolume}
            playbackSpeed={playbackSpeed}
            isPlaying={isPlaying}
            seekTime={seekTime}
            repeat={repeatMode === 'one'}
            onEnded={handleTrackEnded}
            onTimeUpdate={(e) => setAppTime(e.target.currentTime)}
            onLoadedData={(e) => setDuration(e.target.duration)}
          />
        </div>

        {/* Right: Audio Tools (Speed, Sleep Sanctuary, Volume, Expand) */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 select-none justify-end shrink-0 sm:min-w-[160px] lg:min-w-[220px]">
          {/* Recitation Pace Button */}
          <button
            type="button"
            onClick={() => setIsSpeedModalOpen(true)}
            aria-label={`Playback speed: ${playbackSpeed.toFixed(2)}x`}
            title={`Recitation Speed (${playbackSpeed.toFixed(2)}x)`}
            className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
              playbackSpeed !== 1.0
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-midnight-800 text-slate-400 border-midnight-700 hover:text-slate-200'
            }`}
          >
            {playbackSpeed.toFixed(2)}x
          </button>

          {/* Sleep Sanctuary Timer Button */}
          <button
            type="button"
            onClick={() => setIsSleepModalOpen(true)}
            aria-label="Sleep Sanctuary Timer"
            title={sleepTimer.active ? `Sleep Timer: ${formatTimerBadge()}` : 'Sleep Sanctuary Timer'}
            className={`relative p-1.5 sm:p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
              sleepTimer.active
                ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/50'
                : 'bg-midnight-800 text-slate-400 border-midnight-700 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            {sleepTimer.active && (
              <span className="text-[10px] font-bold text-indigo-300">
                {formatTimerBadge()}
              </span>
            )}
          </button>

          {/* Volume Slider Bar (Desktop) */}
          <VolumeBar
            value={localVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            setVolume={handleVolumeChange}
          />

          {/* Expand Fullscreen Player */}
          <button
            type="button"
            onClick={() => dispatch(setIsExpanded(true))}
            aria-label="Expand Player"
            title="Expand Player (Fullscreen)"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-midnight-800 transition"
          >
            <FiMaximize2 size={16} />
          </button>
        </div>
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

      {/* Sleep Sanctuary Modal */}
      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />

      {/* Speed Selector Modal */}
      <SpeedSelectorModal
        isOpen={isSpeedModalOpen}
        onClose={() => setIsSpeedModalOpen(false)}
      />
    </>
  );
};

export default QuranPlayer;
