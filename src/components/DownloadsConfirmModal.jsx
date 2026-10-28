import React, { useEffect } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

const DownloadsConfirmModal = ({
  isOpen,
  mode = 'single', // 'single' | 'all'
  item = null, // for 'single'
  totalCount = 0, // for 'all'
  formattedSize = '',
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
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

  const handleBackdropClick = (e) => {
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
        className="w-full max-w-sm rounded-2xl bg-midnight-900 border border-midnight-700/80 p-5 sm:p-6 shadow-2xl relative text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-800 transition-colors"
          aria-label="Close dialog"
        >
          <FiX size={16} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3.5">
          {isClearAll ? <FiAlertTriangle size={20} /> : <FiTrash2 size={18} />}
        </div>

        <h3 id="confirm-modal-title" className="text-base sm:text-lg font-bold text-slate-100">
          {isClearAll ? 'Clear all downloads?' : 'Remove downloaded recitation?'}
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          {isClearAll ? (
            <>
              Are you sure you want to delete all{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> downloaded recitations
              {formattedSize && (
                <>
                  {' '}(<span className="font-semibold text-indigo-300">{formattedSize}</span>)
                </>
              )}
              {' '}from this device? You can re-download them anytime when online.
            </>
          ) : (
            <>
              Remove the offline audio for{' '}
              <span className="font-semibold text-slate-200">
                {item?.name_simple || item?.surahName || `Surah ${item?.id || item?.surahId}`}
              </span>
              {item?.name_arabic && (
                <span className="font-arabic font-normal text-slate-300 mx-1">
                  ({item.name_arabic})
                </span>
              )}
              {item?.reciter_name && (
                <>
                  {' '}recited by{' '}
                  <span className="font-medium text-slate-300">{item.reciter_name}</span>
                </>
              )}
              ? The surah will remain in your online library.
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-midnight-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-midnight-800 hover:bg-midnight-750 text-slate-300 border border-midnight-700 hover:border-midnight-600 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 hover:border-rose-500/60 transition shadow-sm"
          >
            {isClearAll ? 'Clear All Downloads' : 'Remove Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadsConfirmModal;
