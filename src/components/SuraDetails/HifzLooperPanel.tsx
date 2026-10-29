import React from 'react';
import { FiRepeat } from 'react-icons/fi';

export interface HifzLooperPanelProps {
  isOpen: boolean;
  isActive: boolean;
  startVerse: number;
  endVerse: number;
  maxVerses: number;
  targetLoops: number;
  onStart: () => void;
  onStop: () => void;
  onStartChange: (val: number) => void;
  onEndChange: (val: number) => void;
  onTargetLoopsChange: (val: number) => void;
}

export const HifzLooperPanel: React.FC<HifzLooperPanelProps> = ({
  isOpen,
  isActive,
  startVerse,
  endVerse,
  maxVerses,
  targetLoops,
  onStart,
  onStop,
  onStartChange,
  onEndChange,
  onTargetLoopsChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-midnight-900 border border-midnight-700/80 shadow-xl space-y-3 animate-slidedown">
      <div className="flex items-center justify-between pb-2 border-b border-midnight-800">
        <div className="flex items-center space-x-2">
          <FiRepeat className="text-emerald-400" size={16} />
          <h3 className="text-sm font-bold text-slate-100">
            Hifz Verse Memorization Looper
          </h3>
        </div>
        {isActive ? (
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold"
          >
            Stop Looper
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-950/60"
          >
            Start Memorizing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label htmlFor="hifz-start-input" className="text-slate-400 block mb-1">Start Verse:</label>
          <input
            id="hifz-start-input"
            type="number"
            min="1"
            max={maxVerses || 1}
            value={startVerse}
            onChange={(e) => onStartChange(Number(e.target.value))}
            className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="hifz-end-input" className="text-slate-400 block mb-1">End Verse:</label>
          <input
            id="hifz-end-input"
            type="number"
            min={startVerse}
            max={maxVerses || 1}
            value={endVerse}
            onChange={(e) => onEndChange(Number(e.target.value))}
            className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor="hifz-loops-select" className="text-slate-400 block mb-1">Loop Count:</label>
          <select
            id="hifz-loops-select"
            value={targetLoops}
            onChange={(e) => onTargetLoopsChange(Number(e.target.value))}
            className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
          >
            <option value="3">3 Repetitions</option>
            <option value="5">5 Repetitions</option>
            <option value="10">10 Repetitions</option>
            <option value="0">Infinite Loop (∞)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HifzLooperPanel);
