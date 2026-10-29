import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setPlaybackSpeed, selectPlaybackSpeed } from '../../redux/features/playerSlice';

export interface SpeedSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpeedOption {
  value: number;
  label: string;
  desc: string;
}

const SPEED_OPTIONS: SpeedOption[] = [
  { value: 0.8, label: '0.80x', desc: 'Slow — Tajweed Study & Pronunciation' },
  { value: 0.85, label: '0.85x', desc: 'Careful Articulation' },
  { value: 0.9, label: '0.90x', desc: 'Deliberate Recitation' },
  { value: 1.0, label: '1.00x', desc: 'Natural Sacred Pace (Default)' },
  { value: 1.1, label: '1.10x', desc: 'Muraja`ah — Revision Pacing' },
  { value: 1.15, label: '1.15x', desc: 'Fluent Review' },
  { value: 1.2, label: '1.20x', desc: 'Maximum Reverent Pace' },
];

const SpeedSelectorModal: React.FC<SpeedSelectorModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const currentSpeed = useAppSelector(selectPlaybackSpeed) || 1.0;

  if (!isOpen) return null;

  const handleSelect = (speed: number) => {
    dispatch(setPlaybackSpeed(speed));
    onClose();
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
        aria-label="Playback Speed"
      >
        <div className="flex items-center justify-between pb-4 border-b border-midnight-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {currentSpeed.toFixed(2)}x
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Recitation Pace</h3>
              <p className="text-xs text-slate-400">Pitch-preserved speeds for Tajweed study</p>
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

        <div className="mt-4 space-y-2">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = Math.abs(currentSpeed - opt.value) < 0.01;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-3 rounded-lg transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-slate-100'
                    : 'bg-midnight-850/60 border-midnight-700/50 hover:bg-midnight-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {opt.label}
                    {opt.value === 1.0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
                <span className="text-xs font-semibold text-indigo-400">
                  {isSelected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpeedSelectorModal;
