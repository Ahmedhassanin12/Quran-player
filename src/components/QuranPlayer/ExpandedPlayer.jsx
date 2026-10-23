import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronDown, FiList, FiVolume2, FiVolumeX } from 'react-icons/fi';
import {
  MdSkipNext,
  MdSkipPrevious,
  MdReplay10,
  MdForward10,
} from 'react-icons/md';
import {
  BsArrowRepeat,
  BsFillPauseFill,
  BsFillPlayFill,
  BsShuffle,
} from 'react-icons/bs';
import {
  setIsExpanded,
  playPause,
  cycleRepeatMode,
  toggleShuffle,
  setActiveSura,
} from '../../redux/features/playerSlice';
import { SurahMedallion, ReciterAvatar } from '../IslamicArtwork';

const formatTime = (time) => {
  if (isNaN(time) || time === null || time === undefined) return '0:00';
  const totalSeconds = Math.floor(time);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const ExpandedPlayer = ({
  appTime = 0,
  duration = 0,
  onSeek,
  volume = 0.8,
  onVolumeChange,
  handleNextSong,
  handlePrevSong,
  handleSeekRelative,
}) => {
  const dispatch = useDispatch();
  const {
    activeSura,
    currentSura,
    isPlaying,
    currentReciter,
    repeatMode,
    shuffle,
    isExpanded,
  } = useSelector((state) => state.player);

  const [showQueue, setShowQueue] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        dispatch(playPause(!isPlaying));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekRelative(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekRelative(-10);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        dispatch(setIsExpanded(false));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, isPlaying, dispatch, handleSeekRelative]);

  if (!isExpanded || !activeSura) return null;

  const surahId = activeSura?.chapter_id || activeSura?.id || 1;
  const progressPercentage = duration > 0 ? (appTime / duration) * 100 : 0;
  const remainingTime = duration > appTime ? duration - appTime : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-midnight-950/98 backdrop-blur-2xl text-slate-100 p-6 md:p-10 animate-slideup select-none overflow-y-auto">
      {/* Background Subtle Nocturnal Pattern */}
      <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-midnight-700/80">
        <button
          type="button"
          onClick={() => dispatch(setIsExpanded(false))}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-midnight-800"
        >
          <FiChevronDown size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
            Minimize Player
          </span>
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            Now Reciting
          </span>
          <p className="text-xs text-slate-400 font-arabic mt-0.5">
            تلاوة عطرة مباركة
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className={`flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
            showQueue
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-midnight-800'
          }`}
        >
          <FiList size={18} />
          <span className="hidden sm:inline">Surah Queue</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center my-6 gap-8 max-w-5xl mx-auto w-full">
        {/* Left/Center: Artwork & Recitation Details */}
        <div className="flex-1 flex flex-col items-center text-center max-w-md w-full">
          <SurahMedallion
            number={surahId}
            nameArabic={activeSura?.name_arabic}
            size="xl"
            isPlaying={isPlaying}
            className="shadow-2xl shadow-indigo-950/80 mb-6"
          />

          <h2 className="font-arabic text-4xl sm:text-5xl font-bold text-slate-100 mb-2">
            سورة {activeSura?.name_arabic}
          </h2>

          <h3 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-1">
            {activeSura?.name_simple || `Surah ${surahId}`}
          </h3>

          <p className="text-sm text-slate-400 mb-4">
            {activeSura?.translated_name?.name || 'The Holy Quran'} •{' '}
            <span className="text-indigo-400 font-medium">
              {activeSura?.verses_count} Verses
            </span>
          </p>

          {/* Reciter Badge */}
          {currentReciter && (
            <div className="flex items-center space-x-3.5 px-4 py-2.5 rounded-2xl bg-midnight-850/80 border border-midnight-700/80">
              <ReciterAvatar
                photoUrl={currentReciter.photo_url}
                name={currentReciter.reciter_name}
                arabicName={currentReciter.arabic_name}
                size="sm"
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200">
                  {currentReciter.reciter_name}
                </p>
                <p className="text-[11px] text-indigo-400 font-arabic">
                  {currentReciter.arabic_name} • {currentReciter.style || 'Murattal'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Queue Drawer */}
        {showQueue && (
          <div className="w-full lg:w-80 h-72 lg:h-96 rounded-2xl bg-midnight-850 border border-midnight-700 p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-midnight-700">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Surah Queue ({currentSura?.length || 0})
              </h4>
              <span className="text-[11px] text-indigo-400 font-semibold">
                114 Surahs
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {currentSura?.map((item, idx) => {
                const itemId = item.chapter_id || item.id || idx + 1;
                const isItemCurrent =
                  surahId === itemId || activeSura?.id === item.id;

                return (
                  <button
                    type="button"
                    key={item.id || idx}
                    onClick={() => {
                      dispatch(
                        setActiveSura({
                          sura: item,
                          i: idx,
                          data: currentSura,
                          reciter: currentReciter,
                        }),
                      );
                      dispatch(playPause(true));
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isItemCurrent
                        ? 'bg-midnight-800 text-indigo-300 border border-indigo-500/50 shadow-sm'
                        : 'hover:bg-midnight-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-xs font-mono text-slate-400 w-5">
                        {itemId}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {item.name_simple || `Surah ${itemId}`}
                      </span>
                    </div>
                    <span className="font-arabic text-xs font-bold text-indigo-300">
                      {item.name_arabic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Playback Controls Area */}
      <div className="relative z-10 max-w-3xl mx-auto w-full pt-4">
        {/* Seekbar */}
        <div className="w-full flex items-center space-x-3 mb-4">
          <span className="text-xs text-slate-400 w-12 text-right">
            {formatTime(appTime)}
          </span>

          <div className="relative flex-1 flex items-center group py-2">
            <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <input
              type="range"
              step="any"
              value={appTime || 0}
              min={0}
              max={duration || 100}
              onInput={onSeek}
              aria-label="Seek timeline"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-xs text-slate-400 w-14 text-left">
            -{formatTime(remainingTime)}
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between">
          {/* Shuffle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleShuffle())}
            aria-label="Toggle shuffle"
            className={`p-2.5 rounded-xl transition-colors ${
              shuffle
                ? 'text-indigo-400 bg-indigo-950/70'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BsShuffle size={20} />
          </button>

          {/* Central Controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              type="button"
              onClick={handlePrevSong}
              aria-label="Previous Surah"
              className="text-slate-300 hover:text-white transition-colors p-2"
            >
              <MdSkipPrevious size={32} />
            </button>

            <button
              type="button"
              onClick={() => handleSeekRelative(-10)}
              aria-label="Rewind 10 seconds"
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
            >
              <MdReplay10 size={26} />
            </button>

            {/* Big Play/Pause Button */}
            <button
              type="button"
              onClick={() => dispatch(playPause(!isPlaying))}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-950/70 transition-transform transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <BsFillPauseFill size={36} />
              ) : (
                <BsFillPlayFill size={36} className="pl-1" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSeekRelative(10)}
              aria-label="Forward 10 seconds"
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
            >
              <MdForward10 size={26} />
            </button>

            <button
              type="button"
              onClick={handleNextSong}
              aria-label="Next Surah"
              className="text-slate-300 hover:text-white transition-colors p-2"
            >
              <MdSkipNext size={32} />
            </button>
          </div>

          {/* Repeat Button */}
          <button
            type="button"
            onClick={() => dispatch(cycleRepeatMode())}
            aria-label="Cycle repeat mode"
            className={`relative p-2.5 rounded-xl transition-colors ${
              repeatMode !== 'off'
                ? 'text-indigo-400 bg-indigo-950/70'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BsArrowRepeat size={22} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-indigo-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume Bar in expanded player footer */}
        <div className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-midnight-700/80">
          <button
            type="button"
            onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
            className="text-slate-400 hover:text-white"
          >
            {volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <div className="w-36">
            <input
              type="range"
              step="0.01"
              value={volume}
              min="0"
              max="1"
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedPlayer;
