import React from 'react';
import { formatPlaybackTime } from '../../utils/formatters';

export interface SeekbarProps {
  min?: number;
  max?: number;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  appTime?: number;
}

const Seekbar: React.FC<SeekbarProps> = ({
  min = 0,
  max = 0,
  onInput,
  appTime = 0,
}) => {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeTime = Number.isFinite(appTime) && appTime > 0
    ? Math.min(appTime, safeMax || appTime)
    : 0;
  const percentage = safeMax > 0
    ? Math.min(100, Math.max(0, (safeTime / safeMax) * 100))
    : 0;
  const rangeMax = safeMax > 0 ? safeMax : 1;

  return (
    <div className="w-full flex items-center space-x-3 select-none">
      <span className="text-[11px] font-medium text-slate-400 w-11 text-right shrink-0 tabular-nums">
        {formatPlaybackTime(safeTime)}
      </span>

      <div className="relative flex-1 flex items-center group py-2">
        {/* Background track with indigo progress fill */}
        <div className="w-full h-1.5 bg-midnight-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 group-hover:bg-indigo-400 rounded-full"
            style={{ width: `${percentage}%`, transition: 'width 80ms linear' }}
          />
        </div>

        <input
          type="range"
          step="any"
          value={safeMax > 0 ? safeTime : 0}
          min={min}
          max={rangeMax}
          disabled={safeMax <= 0}
          onChange={onInput}
          aria-label="Seek recitation timeline"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
        />
      </div>

      <span className="text-[11px] font-medium text-slate-400 w-11 text-left shrink-0 tabular-nums">
        {formatPlaybackTime(safeMax)}
      </span>
    </div>
  );
};

export default Seekbar;
