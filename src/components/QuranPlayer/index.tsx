import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMaximize2 } from 'react-icons/fi';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
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
  selectActiveSura,
  selectCurrentSura,
  selectIsActive,
  selectIsPlaying,
  selectCurrentReciter,
  selectRepeatMode,
  selectShuffle,
  selectVolume,
  selectPlaybackSpeed,
  selectSleepTimer,
  selectSeekTime,
  selectSeekCount,
} from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';
import ExpandedPlayer from './ExpandedPlayer';
import SleepTimerModal from './SleepTimerModal';
import SpeedSelectorModal from './SpeedSelectorModal';
import TopScrubber from './TopScrubber';
import { useMediaSession } from '../../hooks/useMediaSession';

const QuranPlayer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeSura = useAppSelector(selectActiveSura);
  const currentSura = useAppSelector(selectCurrentSura);
  const isActive = useAppSelector(selectIsActive);
  const isPlaying = useAppSelector(selectIsPlaying);
  const currentReciter = useAppSelector(selectCurrentReciter);
  const repeatMode = useAppSelector(selectRepeatMode);
  const shuffle = useAppSelector(selectShuffle);
  const storedVolume = useAppSelector(selectVolume);
  const playbackSpeed = useAppSelector(selectPlaybackSpeed);
  const sleepTimer = useAppSelector(selectSleepTimer);
  const reduxSeekTime = useAppSelector(selectSeekTime);
  const seekCount = useAppSelector(selectSeekCount);

  const [duration, setDuration] = useState<number>(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [appTime, setAppTime] = useState<number>(0);
  const [localVolume, setLocalVolume] = useState<number>(storedVolume || 0.8);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState<boolean>(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState<boolean>(false);

  // Identity of the active recitation — used to reset progress UI on track change (critical on iOS)
  const trackKey = [
    activeSura?.chapter_id || activeSura?.id || '',
    activeSura?.reciter_id || currentReciter?.id || '',
    activeSura?.audio_url || '',
  ].join(':');

  // When switching surah/reciter, clear stale duration/position so the bar doesn't jump
  useEffect(() => {
    setDuration(0);
    setAppTime(0);
    setSeekTime(0);
  }, [trackKey]);

  // Synchronize seekTime triggered from outside (e.g. handleJumpToVerse, ContinueListening, Hifz loop)
  useEffect(() => {
    if (typeof reduxSeekTime === 'number' && !Number.isNaN(reduxSeekTime)) {
      setAppTime(reduxSeekTime);
      setSeekTime(reduxSeekTime);
    }
  }, [reduxSeekTime, seekCount]);

  const handleDurationUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.target as HTMLAudioElement;
    const next = Number(audio?.duration);
    if (Number.isFinite(next) && next > 0) {
      setDuration(next);
    }
  }, []);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.target as HTMLAudioElement;
    const next = Number(audio?.currentTime);
    if (!Number.isFinite(next) || next < 0) return;
    setAppTime((prev) => {
      if (Math.abs(prev - next) < 0.05) return prev;
      return next;
    });
  }, []);

  const handlePlayPause = useCallback((forcedState?: boolean) => {
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

  const handleSeekRelative = useCallback((seconds: number) => {
    setAppTime((prev) => {
      const newTime = Math.max(0, Math.min(duration || 0, prev + seconds));
      setSeekTime(newTime);
      return newTime;
    });
  }, [duration]);

  const handleSeekDirect = useCallback((newTime: number) => {
    const clamped = Math.max(0, Math.min(duration || 0, newTime));
    setAppTime(clamped);
    setSeekTime(clamped);
  }, [duration]);

  const handleSeekInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(event.target.value);
    handleSeekDirect(newTime);
  };

  const handleVolumeChange = (newVal: number) => {
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
    if (!sleepTimer?.active || sleepTimer.mode === 'surah') return undefined;

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
  }, [sleepTimer?.active, sleepTimer?.isFadingOut, sleepTimer?.remainingSeconds, storedVolume, localVolume]);

  // Periodically throttle saving playback position for "Continue Listening"
  useEffect(() => {
    if (!isPlaying || !activeSura || appTime <= 0) return undefined;

    const timer = setTimeout(() => {
      dispatch(savePlaybackProgress(appTime));
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPlaying, activeSura, appTime, dispatch]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

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

  const formatTimerBadge = (): string | null => {
    if (!sleepTimer.active) return null;
    if (sleepTimer.mode === 'surah') return t('player.sleepTimerEndOfSurah');
    const mins = Math.ceil(sleepTimer.remainingSeconds / 60);
    return t('player.sleepTimerMinutes', { minutes: mins });
  };

  return (
    <>
      {/* Audio Player Container: Docked on Mobile/Tablet (<lg), Floating Island on Large Screens (lg+) */}
      <div className="w-full shrink-0 relative lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-30 lg:flex lg:justify-center lg:px-6 lg:pb-4 lg:pointer-events-none animate-slideup">
        <footer
          className="w-full lg:max-w-6xl lg:pointer-events-auto relative bg-midnight-900/98 lg:bg-midnight-900/92 backdrop-blur-xl lg:backdrop-blur-lg sm:border-t sm:border-midnight-700/80 lg:border lg:rounded-2xl lg:shadow-[0_12px_40px_rgba(0,0,0,0.65)] lg:ring-1 lg:ring-white/[0.06] px-2.5 sm:px-6 lg:px-8 py-2 sm:py-0 min-h-[4.25rem] sm:h-20 lg:h-20 flex items-center justify-between transition-all duration-200 pb-[env(safe-area-inset-bottom,0px)] lg:pb-0 hover:border-midnight-600/80"
          role="region"
          aria-label={t('player.regionLabel')}
        >
          {/* Interactive Top-Edge "Tape" Timeline Scrubber (mobile) */}
          <TopScrubber
            key={trackKey}
            appTime={appTime}
            duration={duration}
            onSeek={handleSeekDirect}
          />

          {/* Active Surah Track Information */}
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

            <div className="w-full hidden sm:block max-w-full px-0.5 sm:px-0">
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
              seekCount={seekCount}
              repeat={repeatMode === 'one'}
              onEnded={handleTrackEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={handleDurationUpdate}
              onDurationChange={handleDurationUpdate}
            />
          </div>

          {/* Audio Tools (Speed, Sleep Sanctuary, Volume, Expand) */}
          <div className="flex items-center gap-1 sm:gap-2 select-none justify-end shrink-0 sm:min-w-[150px] lg:min-w-[200px]">
            {/* Recitation Pace Button */}
            <button
              type="button"
              onClick={() => setIsSpeedModalOpen(true)}
              aria-label={t('player.speedAria', { speed: playbackSpeed.toFixed(2) })}
              title={t('player.speedTitle', { speed: playbackSpeed.toFixed(2) })}
              className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition border ${
                playbackSpeed !== 1.0
                  ? 'bg-midnight-750 text-indigo-300 border-indigo-500/50'
                  : 'bg-midnight-800 text-slate-400 border-midnight-700 hover:text-slate-200'
              }`}
            >
              <span dir="ltr">{playbackSpeed.toFixed(2)}x</span>
            </button>

            {/* Sleep Sanctuary Timer Button */}
            <button
              type="button"
              onClick={() => setIsSleepModalOpen(true)}
              aria-label={t('player.sleepTimerTitle')}
              title={sleepTimer.active ? `${t('player.sleepTimerTitle')}: ${formatTimerBadge()}` : t('player.sleepTimerTitle')}
              className={`relative p-1.5 sm:p-2 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                sleepTimer.active
                  ? 'bg-midnight-750 text-indigo-300 border-indigo-500/50'
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
              aria-label={t('player.expandPlayerAria')}
              title={t('player.expandPlayerTitle')}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-midnight-800 transition"
            >
              <FiMaximize2 size={16} />
            </button>
          </div>
        </footer>
      </div>

      {/* Expanded Player Overlay Modal */}
      <ExpandedPlayer
        key={`expanded-${trackKey}`}
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
