import React from 'react';
import { useTranslation } from 'react-i18next';
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
import type { RepeatMode } from '../../types/player';

export interface ControlsProps {
  isPlaying?: boolean;
  isActive?: boolean;
  repeatMode?: RepeatMode;
  cycleRepeatMode?: () => void;
  shuffle?: boolean;
  toggleShuffle?: () => void;
  handlePlayPause?: () => void;
  handlePrevSong?: () => void;
  handleNextSong?: () => void;
  handleSeekRelative?: (deltaSeconds: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying = false,
  isActive = false,
  repeatMode = 'off',
  cycleRepeatMode,
  shuffle = false,
  toggleShuffle,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  handleSeekRelative,
}) => {
  const { t } = useTranslation();

  return (
    <div dir="ltr" className="flex w-full items-center sm:justify-center gap-1.5 sm:gap-4 select-none shrink-0">
      {/* Shuffle Button */}
      <button
        type="button"
        onClick={toggleShuffle}
        aria-label={t('player.shuffleAria')}
        title={t('player.shuffleTitle')}
        className={`hidden sm:flex items-center justify-center p-1.5 rounded-lg transition-colors ${
          shuffle
            ? 'text-indigo-400 bg-midnight-800 border border-indigo-500/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BsShuffle size={16} />
      </button>

      {/* Previous Track */}
      <button
        type="button"
        onClick={handlePrevSong}
        aria-label={t('player.previousSurahAria')}
        title={t('player.previousSurahTitle')}
        className="text-slate-300 hover:text-white transition-colors p-1"
      >
        <MdSkipPrevious size={24} />
      </button>

      {/* Rewind 10s */}
      {handleSeekRelative && (
        <button
          type="button"
          onClick={() => handleSeekRelative(-10)}
          aria-label={t('player.rewind10Aria')}
          title={t('player.rewind10Title')}
          className="hidden md:flex text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <MdReplay10 size={22} />
        </button>
      )}

      {/* Play / Pause Primary Button */}
      <button
        type="button"
        onClick={handlePlayPause}
        aria-label={isPlaying ? t('player.pauseAria') : t('player.playAria')}
        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-950/60 transition-transform duration-150 transform hover:scale-105 active:scale-95 focus:outline-none shrink-0"
      >
        {isPlaying && isActive ? (
          <BsFillPauseFill size={24} />
        ) : (
          <BsFillPlayFill size={24} className="ps-0.5" />
        )}
      </button>

      {/* Forward 10s */}
      {handleSeekRelative && (
        <button
          type="button"
          onClick={() => handleSeekRelative(10)}
          aria-label={t('player.forward10Aria')}
          title={t('player.forward10Title')}
          className="hidden md:flex text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <MdForward10 size={22} />
        </button>
      )}

      {/* Next Track */}
      <button
        type="button"
        onClick={handleNextSong}
        aria-label={t('player.nextSurahAria')}
        title={t('player.nextSurahTitle')}
        className="text-slate-300 hover:text-white transition-colors p-1"
      >
        <MdSkipNext size={26} />
      </button>

      {/* Repeat Button (Off / All / One) */}
      <button
        type="button"
        onClick={cycleRepeatMode}
        aria-label={t('player.repeatAria')}
        title={t('player.repeatTitle')}
        className={`relative hidden sm:flex items-center justify-center p-1.5 rounded-lg transition-colors ${
          repeatMode !== 'off'
            ? 'text-indigo-400 bg-midnight-800 border border-indigo-500/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BsArrowRepeat size={18} />
        {repeatMode === 'one' && (
          <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-indigo-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
            1
          </span>
        )}
      </button>
    </div>
  );
};

export default Controls;
