import React from 'react';

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

const Seekbar = ({
  value = 0,
  min = 0,
  max = 0,
  onInput,
  appTime = 0,
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (appTime / max) * 100)) : 0;

  return (
    <div className="w-full flex items-center space-x-3 select-none">
      <span className="text-[11px] font-medium text-slate-400 w-11 text-right shrink-0">
        {formatTime(appTime)}
      </span>

      <div className="relative flex-1 flex items-center group py-2">
        {/* Background track with emerald progress fill */}
        <div className="w-full h-1.5 bg-charcoal-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 group-hover:bg-emerald-400 transition-all rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <input
          type="range"
          step="any"
          value={appTime || 0}
          min={min}
          max={max || 100}
          onInput={onInput}
          aria-label="Seek recitation timeline"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="text-[11px] font-medium text-slate-400 w-11 text-left shrink-0">
        {formatTime(max)}
      </span>
    </div>
  );
};

export default Seekbar;
