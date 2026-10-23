import React from 'react';
import { BsFillPlayFill, BsFillPauseFill } from 'react-icons/bs';

const PlayPause = ({
  isPlaying,
  activeSura,
  sura,
  handlePause,
  handlePlay,
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const isCurrent =
    activeSura &&
    sura &&
    ((activeSura.chapter_id &&
      (sura.chapter_id || sura.id) === activeSura.chapter_id) ||
      activeSura.id === sura.id ||
      activeSura.name_simple === sura.name_simple);

  const isCurrentAndPlaying = isPlaying && isCurrent;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-13 h-13 text-xl',
  };

  const iconSizes = {
    sm: 15,
    md: 20,
    lg: 26,
  };

  const btnDimension = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  return isCurrentAndPlaying ? (
    <button
      type="button"
      aria-label="Pause recitation"
      onClick={(e) => {
        e.stopPropagation();
        handlePause();
      }}
      className={`${btnDimension} flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-950/50 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400/50`}
    >
      <BsFillPauseFill size={iconSize} />
    </button>
  ) : (
    <button
      type="button"
      aria-label="Play recitation"
      onClick={(e) => {
        e.stopPropagation();
        handlePlay();
      }}
      className={`${btnDimension} flex items-center justify-center rounded-full bg-midnight-800 hover:bg-indigo-500 text-slate-200 hover:text-white border border-midnight-700 hover:border-indigo-400 shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 pl-0.5`}
    >
      <BsFillPlayFill size={iconSize} />
    </button>
  );
};

export default PlayPause;
