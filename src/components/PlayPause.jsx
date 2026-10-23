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
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28,
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
      className={`${btnDimension} flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 shadow-lg shadow-emerald-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
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
      className={`${btnDimension} flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 shadow-lg shadow-emerald-500/30 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 pl-0.5`}
    >
      <BsFillPlayFill size={iconSize} />
    </button>
  );
};

export default PlayPause;
