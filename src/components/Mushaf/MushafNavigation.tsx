import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBookmark,
  FiImage,
  FiFileText,
} from 'react-icons/fi';
import { TOTAL_MUSHAF_PAGES } from '../../assets/mushafMetadata';
import { formatNumber } from '../../utils/formatters';
import { normalizeLanguage } from '../../i18n';
import type { MushafPageMetadata, MushafEngine, MushafBookmark } from '../../types/mushaf';

export interface MushafNavigationProps {
  currentPage: number;
  pageInfo?: MushafPageMetadata | null;
  onPageChange: (page: number) => void;
  viewEngine?: MushafEngine;
  onViewEngineChange: (engine: MushafEngine) => void;
  bookmarks?: MushafBookmark[];
  onOpenBookmarks?: () => void;
}

const MushafNavigation: React.FC<MushafNavigationProps> = ({
  currentPage,
  pageInfo,
  onPageChange,
  viewEngine = 'plate',
  onViewEngineChange,
  bookmarks = [],
  onOpenBookmarks,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const isRtl = currentLang === 'ar';
  const [jumpInput, setJumpInput] = useState('');
  const [isJumpOpen, setIsJumpOpen] = useState(false);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < TOTAL_MUSHAF_PAGES) {
      onPageChange(currentPage + 1);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!Number.isNaN(target) && target >= 1 && target <= TOTAL_MUSHAF_PAGES) {
      onPageChange(target);
      setIsJumpOpen(false);
      setJumpInput('');
    }
  };

  const PrevChevron = isRtl ? FiChevronRight : FiChevronLeft;
  const NextChevron = isRtl ? FiChevronLeft : FiChevronRight;

  const surahDisplayName = isRtl
    ? pageInfo?.surahNameArabic || t('common.holyQuran')
    : pageInfo?.surahNameEnglish || pageInfo?.surahNameArabic || t('common.holyQuran');

  return (
    <div className="w-full bg-midnight-900/90 border border-midnight-700/80 rounded-xl p-3 sm:p-4 mb-4 shadow-xl select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Start: Page & Juz Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-800 border border-midnight-700">
            <span className="text-xs font-bold text-indigo-400">
              {surahDisplayName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-medium text-slate-300">
              {t('mushaf.juz', { number: formatNumber(pageInfo?.juz || 1, currentLang) as unknown as number })}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-midnight-800/80 border border-midnight-700 text-xs font-mono font-semibold text-slate-200" dir="ltr">
            {currentPage} / {TOTAL_MUSHAF_PAGES}
          </div>
        </div>

        {/* Center: Primary Page Nav Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Page */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            aria-label={t('mushaf.prevPageAria')}
            title={t('mushaf.prevPageTitle', { page: Math.max(1, currentPage - 1) })}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 transition"
          >
            <PrevChevron size={16} />
          </button>

          {/* Quick Page Jump Button */}
          {isJumpOpen ? (
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={TOTAL_MUSHAF_PAGES}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={t('mushaf.jumpPlaceholder')}
                autoFocus
                className="w-16 px-2 py-1.5 rounded-lg bg-midnight-950 border border-indigo-500/60 text-xs text-center font-mono text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {t('mushaf.jumpGo')}
              </button>
              <button
                type="button"
                onClick={() => setIsJumpOpen(false)}
                className="px-2 py-1.5 rounded-lg bg-midnight-800 text-slate-400 text-xs hover:text-slate-200"
              >
                {t('mushaf.jumpCancel')}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsJumpOpen(true)}
              title={t('mushaf.clickToJumpTitle')}
              className="px-3 py-2 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 text-xs font-semibold text-indigo-300 transition"
            >
              {t('mushaf.page', { current: formatNumber(currentPage, currentLang) as unknown as number })}
            </button>
          )}

          {/* Next Page */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= TOTAL_MUSHAF_PAGES}
            aria-label={t('mushaf.nextPageAria')}
            title={t('mushaf.nextPageTitle', { page: Math.min(TOTAL_MUSHAF_PAGES, currentPage + 1) })}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 transition"
          >
            <NextChevron size={16} />
          </button>
        </div>

        {/* End: Engine Switch (Calligraphy Plate vs 15-Line Typography) + Bookmarks */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-lg bg-midnight-850 border border-midnight-700/80 text-xs">
            <button
              type="button"
              onClick={() => onViewEngineChange('plate')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
                viewEngine === 'plate'
                  ? 'bg-midnight-750 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t('mushaf.printedMushafTitle')}
            >
              <FiImage size={13} />
              <span className="hidden sm:inline">{t('mushaf.printedMushaf')}</span>
            </button>

            <button
              type="button"
              onClick={() => onViewEngineChange('digital')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition ${
                viewEngine === 'digital'
                  ? 'bg-midnight-750 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={t('mushaf.digitalMushafTitle')}
            >
              <FiFileText size={13} />
              <span className="hidden sm:inline">{t('mushaf.digitalMushaf')}</span>
            </button>
          </div>

          {onOpenBookmarks && (
            <button
              type="button"
              onClick={onOpenBookmarks}
              aria-label={t('mushaf.bookmarksTitle')}
              title={t('mushaf.bookmarksCount', { count: formatNumber(bookmarks.length, currentLang) as unknown as number })}
              className="relative p-2.5 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 text-slate-300 hover:text-indigo-300 transition"
            >
              <FiBookmark size={15} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {formatNumber(bookmarks.length, currentLang)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MushafNavigation;
