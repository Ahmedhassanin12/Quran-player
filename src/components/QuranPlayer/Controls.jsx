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
  <div className="flex items-center space-x-3 sm:space-x-5 select-none">
    {/* Shuffle Button */}
    <button
      type="button"
      onClick={toggleShuffle}
      aria-label="Toggle shuffle mode"
      title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
      className={`hidden sm:flex items-center justify-center p-1.5 rounded-lg transition-colors ${
        shuffle
          ? 'text-emerald-400 bg-emerald-950/60'
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
      <MdSkipPrevious size={26} />
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
      className="w-11 h-11 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-charcoal-950 shadow-lg shadow-emerald-500/25 transition-transform duration-150 transform hover:scale-105 active:scale-95 focus:outline-none"
    >
      {isPlaying && isActive ? (
        <BsFillPauseFill size={26} />
      ) : (
        <BsFillPlayFill size={26} className="pl-0.5" />
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
          ? 'text-emerald-400 bg-emerald-950/60'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <BsArrowRepeat size={18} />
      {repeatMode === 'one' && (
        <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-emerald-500 text-charcoal-950 rounded-full w-3.5 h-3.5 flex items-center justify-center">
          1
        </span>
      )}
    </button>
  </div>
);

export default Controls;
