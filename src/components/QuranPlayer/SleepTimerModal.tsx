import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSleepTimer, clearSleepTimer, selectSleepTimer } from '../../redux/features/playerSlice';
import type { SleepTimerMode } from '../../types/player';

export interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimerOption {
  label: string;
  mode: SleepTimerMode;
  minutes: number | null;
  desc: string;
}

const TIMER_OPTIONS: TimerOption[] = [
  { label: 'End of Surah', mode: 'surah', minutes: null, desc: 'Stop gently when recitation finishes' },
  { label: '15 Minutes', mode: '15', minutes: 15, desc: 'Quick rest or nap' },
  { label: '30 Minutes', mode: '30', minutes: 30, desc: 'Standard evening relaxation' },
  { label: '45 Minutes', mode: '45', minutes: 45, desc: 'Extended nocturnal reflection' },
  { label: '60 Minutes', mode: '60', minutes: 60, desc: 'One hour continuous recitation' },
];

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const sleepTimer = useAppSelector(selectSleepTimer);

  if (!isOpen) return null;

  const handleSelect = (option: TimerOption) => {
    dispatch(setSleepTimer({ mode: option.mode, minutes: option.minutes || undefined }));
    onClose();
  };

  const handleClear = () => {
    dispatch(clearSleepTimer());
    onClose();
  };

  const formatRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-slowfade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-midnight-900 border border-midnight-700 p-6 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sleep Sanctuary Timer"
      >
        <div className="flex items-center justify-between pb-4 border-b border-midnight-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Sleep Sanctuary</h3>
              <p className="text-xs text-slate-400">Timer with smooth 30s volume fade</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-800 transition"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Current Timer Status */}
        {sleepTimer.active && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="text-xs text-indigo-300">
              <span className="font-semibold block text-slate-200">Active Timer:</span>
              {sleepTimer.mode === 'surah' ? 'End of Surah' : `${formatRemaining(sleepTimer.remainingSeconds)} remaining`}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Timer Options List */}
        <div className="mt-4 space-y-2">
          {TIMER_OPTIONS.map((opt) => {
            const isSelected = sleepTimer.active && sleepTimer.mode === opt.mode;
            return (
              <button
                key={String(opt.mode)}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-3 rounded-lg transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-slate-100'
                    : 'bg-midnight-850/60 border-midnight-700/50 hover:bg-midnight-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {opt.label}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
                <span className="text-xs font-semibold text-indigo-400">
                  {isSelected ? 'Selected' : 'Set'}
                </span>
              </button>
            );
          })}
        </div>

        {sleepTimer.active && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full mt-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-midnight-800 rounded-lg transition border border-midnight-700/60"
          >
            Cancel Timer
          </button>
        )}
      </div>
    </div>
  );
};

export default SleepTimerModal;
