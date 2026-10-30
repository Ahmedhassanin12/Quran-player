import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setPlaybackSpeed, selectPlaybackSpeed } from '../../redux/features/playerSlice';

export interface SpeedSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SpeedKey = '0.8' | '0.85' | '0.9' | '1' | '1.1' | '1.15' | '1.2';

const SPEED_OPTIONS: { value: number; key: SpeedKey; label: string }[] = [
  { value: 0.8, key: '0.8', label: '0.80x' },
  { value: 0.85, key: '0.85', label: '0.85x' },
  { value: 0.9, key: '0.9', label: '0.90x' },
  { value: 1.0, key: '1', label: '1.00x' },
  { value: 1.1, key: '1.1', label: '1.10x' },
  { value: 1.15, key: '1.15', label: '1.15x' },
  { value: 1.2, key: '1.2', label: '1.20x' },
];

const SpeedSelectorModal: React.FC<SpeedSelectorModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-slowfade select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-midnight-900 border border-midnight-700 p-6 shadow-2xl relative text-start"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('speedSelector.title')}
      >
        <div className="flex items-center justify-between pb-4 border-b border-midnight-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs" dir="ltr">
              {currentSpeed.toFixed(2)}x
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{t('speedSelector.title')}</h3>
              <p className="text-xs text-slate-400">{t('speedSelector.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-midnight-800 transition"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = Math.abs(currentSpeed - opt.value) < 0.01;
            const desc = t(`speedSelector.options.${opt.key}`);

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-start p-3 rounded-lg transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-slate-100'
                    : 'bg-midnight-850/60 border-midnight-700/50 hover:bg-midnight-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span dir="ltr">{opt.label}</span>
                    {opt.value === 1.0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                        {t('speedSelector.default')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
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
