import React from 'react';
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

const Controls = ({
  isPlaying,
  isActive,
  repeatMode = 'off', // 'off' | 'all' | 'one'
  cycleRepeatMode,
  shuffle = false,
  toggleShuffle,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  handleSeekRelative,
}) => (
  <div className="flex w-full  items-center sm:justify-center space-x-1.5 sm:space-x-4 select-none shrink-0">
    {/* Shuffle Button */}
    <button
      type="button"
      onClick={toggleShuffle}
      aria-label="Toggle shuffle mode"
      title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
      className={`hidden sm:flex items-center justify-center p-1.5 rounded-lg transition-colors ${
        shuffle
          ? 'text-indigo-400 bg-indigo-950/70'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <BsShuffle size={16} />
    </button>

    {/* Previous Track */}
    <button
      type="button"
      onClick={handlePrevSong}
      aria-label="Previous Surah"
      title="Previous Surah"
      className="text-slate-300 hover:text-white transition-colors p-1"
    >
      <MdSkipPrevious size={24} />
    </button>

    {/* Rewind 10s */}
    {handleSeekRelative && (
      <button
        type="button"
        onClick={() => handleSeekRelative(-10)}
        aria-label="Rewind 10 seconds"
        title="Rewind 10s"
        className="hidden md:flex text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <MdReplay10 size={22} />
      </button>
    )}

    {/* Play / Pause Primary Button */}
    <button
      type="button"
      onClick={handlePlayPause}
      aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-950/60 transition-transform duration-150 transform hover:scale-105 active:scale-95 focus:outline-none shrink-0"
    >
      {isPlaying && isActive ? (
        <BsFillPauseFill size={24} />
      ) : (
        <BsFillPlayFill size={24} className="pl-0.5" />
      )}
    </button>

    {/* Forward 10s */}
    {handleSeekRelative && (
      <button
        type="button"
        onClick={() => handleSeekRelative(10)}
        aria-label="Forward 10 seconds"
        title="Forward 10s"
        className="hidden md:flex text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <MdForward10 size={22} />
      </button>
    )}

    {/* Next Track */}
    <button
      type="button"
      onClick={handleNextSong}
      aria-label="Next Surah"
      title="Next Surah"
      className="text-slate-300 hover:text-white transition-colors p-1"
    >
      <MdSkipNext size={26} />
    </button>

    {/* Repeat Button (Off / All / One) */}
    <button
      type="button"
      onClick={cycleRepeatMode}
      aria-label="Cycle repeat mode"
      title={`Repeat: ${repeatMode}`}
      className={`relative hidden sm:flex items-center justify-center p-1.5 rounded-lg transition-colors ${
        repeatMode !== 'off'
          ? 'text-indigo-400 bg-indigo-950/70'
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

export default Controls;
