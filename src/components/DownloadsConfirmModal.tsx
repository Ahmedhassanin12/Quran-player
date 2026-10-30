import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { formatNumber } from '../utils/formatters';
import { getLocalizedReciterName, getLocalizedSurahName } from '../utils/quranUtils';
import { normalizeLanguage } from '../i18n';
import type { Surah } from '../types/quran';
import type { DownloadedSurahMetadata } from '../types/downloads';

export type DownloadsConfirmModalMode = 'single' | 'all';

export interface DownloadsConfirmModalProps {
  isOpen: boolean;
  mode?: DownloadsConfirmModalMode;
  item?: (Surah & Partial<DownloadedSurahMetadata>) | null;
  totalCount?: number;
  formattedSize?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DownloadsConfirmModal: React.FC<DownloadsConfirmModalProps> = ({
  isOpen,
  mode = 'single',
  item = null,
  totalCount = 0,
  formattedSize = '',
  onClose,
  onConfirm,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isClearAll = mode === 'all';
  const surahName = getLocalizedSurahName(item, currentLang);
  const reciterName = getLocalizedReciterName(item, currentLang);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-slowfade select-none"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-midnight-900 border border-midnight-700/80 p-5 sm:p-6 shadow-2xl relative text-start"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-800 transition-colors"
          aria-label={t('common.close')}
        >
          <FiX size={16} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3.5">
          {isClearAll ? <FiAlertTriangle size={20} /> : <FiTrash2 size={18} />}
        </div>

        <h3 id="confirm-modal-title" className="text-base sm:text-lg font-bold text-slate-100">
          {isClearAll ? t('downloads.modal.clearAllTitle') : t('downloads.modal.removeSingleTitle')}
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          {isClearAll
            ? t('downloads.modal.clearAllMessage', {
              count: formatNumber(totalCount, currentLang) as unknown as number,
              size: formattedSize,
            })
            : t('downloads.modal.removeSingleMessage', {
              surahName,
              reciterName,
            })}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-midnight-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-midnight-800 hover:bg-midnight-750 text-slate-300 border border-midnight-700 hover:border-midnight-600 transition"
          >
            {t('downloads.modal.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 hover:border-rose-500/60 transition shadow-sm"
          >
            {isClearAll ? t('downloads.modal.confirmClearAll') : t('downloads.modal.confirmRemoveSingle')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadsConfirmModal;
