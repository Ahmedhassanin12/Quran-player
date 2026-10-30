import React from 'react';
import { useTranslation } from 'react-i18next';
import { RiCloseLine } from 'react-icons/ri';
import { FiTrash2, FiBookmark } from 'react-icons/fi';
import { formatNumber, formatDate } from '../../utils/formatters';
import { getLocalizedSurahName } from '../../utils/quranUtils';
import { normalizeLanguage } from '../../i18n';
import type { MushafBookmark } from '../../types/mushaf';

export interface MushafBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks?: MushafBookmark[];
  onSelectBookmark: (bookmark: MushafBookmark) => void;
  onRemoveBookmark: (verseKey: string) => void;
}

const MushafBookmarksModal: React.FC<MushafBookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks = [],
  onSelectBookmark,
  onRemoveBookmark,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-slowfade select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-midnight-900 border border-midnight-700/80 rounded-xl p-5 sm:p-6 shadow-2xl text-start overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-midnight-700/70">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <FiBookmark size={18} />
            <span>{t('mushaf.bookmarksTitle')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-midnight-800 transition"
            aria-label={t('common.close')}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* List of bookmarks */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pe-1 hide-scrollbar">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FiBookmark size={32} className="mx-auto text-slate-600 opacity-60" />
              <p className="text-xs font-semibold text-slate-300">{t('mushaf.noBookmarksTitle')}</p>
              <p className="text-[11px] text-slate-500">
                {t('mushaf.noBookmarksDesc')}
              </p>
            </div>
          ) : (
            bookmarks.map((b) => {
              const surahId = b.surahNumber || Number(b.verseKey?.split(':')[0]);
              const localizedSurah = getLocalizedSurahName(
                { id: surahId, name_arabic: b.arabicName || b.surahName },
                currentLang,
              );
              const [surahNum, ayahNum] = (b.verseKey || '1:1').split(':');

              return (
                <div
                  key={b.verseKey}
                  onClick={() => {
                    onSelectBookmark(b);
                    onClose();
                  }}
                  className="p-3.5 rounded-lg bg-midnight-850 hover:bg-midnight-800 border border-midnight-750 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group shadow-sm"
                >
                  <div className="text-start">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        {localizedSurah}
                      </span>
                      <span className="text-xs font-mono font-semibold text-indigo-400 bg-midnight-800 px-2 py-0.5 rounded-md border border-midnight-700">
                        {t('mushaf.ayahModal.ayahBadge', { surah: surahNum, ayah: ayahNum })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{t('mushaf.page', { current: formatNumber(b.pageNumber, currentLang) as unknown as number })}</span>
                      {b.createdAt && (
                        <>
                          <span>•</span>
                          <span>{formatDate(b.createdAt, currentLang)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(b.verseKey);
                      }}
                      title={t('mushaf.deleteBookmarkTitle')}
                      aria-label={t('mushaf.deleteBookmarkTitle')}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MushafBookmarksModal;
