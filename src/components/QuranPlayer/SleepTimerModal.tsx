import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setSleepTimer, clearSleepTimer, selectSleepTimer } from '../../redux/features/playerSlice';
import type { SleepTimerMode } from '../../types/player';

export interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimerOptionConfig {
  mode: SleepTimerMode;
  minutes: number | null;
}

const TIMER_OPTION_CONFIGS: TimerOptionConfig[] = [
  { mode: 'surah', minutes: null },
  { mode: '15', minutes: 15 },
  { mode: '30', minutes: 30 },
  { mode: '45', minutes: 45 },
  { mode: '60', minutes: 60 },
];

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sleepTimer = useAppSelector(selectSleepTimer);

  if (!isOpen) return null;

  const handleSelect = (option: TimerOptionConfig) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-slowfade select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-midnight-900 border border-midnight-700 p-6 shadow-2xl relative text-start"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('sleepTimer.title')}
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
              <h3 className="text-base font-semibold text-slate-100">{t('sleepTimer.title')}</h3>
              <p className="text-xs text-slate-400">{t('sleepTimer.subtitle')}</p>
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

        {/* Current Timer Status */}
        {sleepTimer.active && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="text-xs text-indigo-300">
              <span className="font-semibold block text-slate-200">{t('sleepTimer.activeTimer')}:</span>
              {sleepTimer.mode === 'surah'
                ? t('sleepTimer.endOfCurrentSurah')
                : t('sleepTimer.remaining', { time: formatRemaining(sleepTimer.remainingSeconds) })}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition"
            >
              {t('sleepTimer.turnOff')}
            </button>
          </div>
        )}

        {/* Timer Options List */}
        <div className="mt-4 space-y-2">
          {TIMER_OPTION_CONFIGS.map((opt) => {
            const isSelected = sleepTimer.active && sleepTimer.mode === opt.mode;
            const modeKey = opt.mode as 'surah' | '15' | '30' | '45' | '60';
            const label = t(`sleepTimer.options.${modeKey}.label`);
            const desc = t(`sleepTimer.options.${modeKey}.description`);

            return (
              <button
                key={String(opt.mode)}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-start p-3 rounded-lg transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-slate-100'
                    : 'bg-midnight-850/60 border-midnight-700/50 hover:bg-midnight-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {label}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                </div>
                <span className="text-xs font-semibold text-indigo-400">
                  {isSelected ? t('sleepTimer.selected') : t('sleepTimer.set')}
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
            {t('sleepTimer.cancelTimer')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SleepTimerModal;
