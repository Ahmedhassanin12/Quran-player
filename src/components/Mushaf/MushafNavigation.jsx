import React, { useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBookmark,
  FiSliders,
  FiImage,
  FiFileText,
} from 'react-icons/fi';
import { TOTAL_MUSHAF_PAGES } from '../../assets/mushafMetadata';

const MushafNavigation = ({
  currentPage,
  pageInfo,
  onPageChange,
  viewEngine = 'plate', // 'plate' | 'digital'
  onViewEngineChange,
  bookmarks = [],
  onOpenBookmarks,
}) => {
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

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= TOTAL_MUSHAF_PAGES) {
      onPageChange(target);
      setIsJumpOpen(false);
      setJumpInput('');
    }
  };

  return (
    <div className="w-full  bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-3 sm:p-4 mb-4 shadow-xl select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Page & Juz Indicators */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-right">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-midnight-800 border border-midnight-700">
            <span className="text-xs font-bold text-indigo-400 font-arabic">
              {pageInfo?.surahNameArabic || 'القرآن الكريم'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-medium text-slate-300">
              الجزء {pageInfo?.juz}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-midnight-800/80 border border-midnight-700 text-xs font-mono font-semibold text-slate-200">
            {currentPage} / {TOTAL_MUSHAF_PAGES}
          </div>
        </div>

        {/* Center: Primary Page Nav Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Page (RTL: Left button goes to previous page) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            aria-label="Previous Page"
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 transition"
          >
            <FiChevronLeft size={16} />
            <span className="hidden xs:inline">السابقة</span>
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
                placeholder="١-٦٠٤"
                autoFocus
                className="w-16 px-2 py-1.5 rounded-lg bg-midnight-950 border border-indigo-500/60 text-xs text-center font-mono text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                انتقال
              </button>
              <button
                type="button"
                onClick={() => setIsJumpOpen(false)}
                className="px-2 py-1.5 rounded-lg bg-midnight-800 text-slate-400 text-xs hover:text-slate-200"
              >
                إلغاء
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsJumpOpen(true)}
              className="px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 text-xs font-semibold text-indigo-300 transition"
            >
              صفحة {currentPage}
            </button>
          )}

          {/* Next Page (RTL: Right button goes to next page) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= TOTAL_MUSHAF_PAGES}
            aria-label="Next Page"
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-200 transition"
          >
            <span className="hidden xs:inline">التالية</span>
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Right: Engine Switch (Calligraphy Plate vs 15-Line Typography) + Bookmarks */}
        <div className="flex items-center space-x-2">
          {/* Engine Selector */}
          <div className="flex p-1 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs">
            <button
              type="button"
              onClick={() => onViewEngineChange('plate')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
                viewEngine === 'plate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="لوحة المصحف المطبوع (المطبعة الشريفة)"
            >
              <FiImage size={13} />
              <span className="hidden sm:inline">المصحف المطبوع</span>
            </button>

            <button
              type="button"
              onClick={() => onViewEngineChange('digital')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
                viewEngine === 'digital'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="المصحف الرقمي المسطر (١٥ سطراً مطابقاً)"
            >
              <FiFileText size={13} />
              <span className="hidden sm:inline">١٥ سطراً رقمياً</span>
            </button>
          </div>

          {/* Bookmarks Counter Button */}
          {onOpenBookmarks && (
            <button
              type="button"
              onClick={onOpenBookmarks}
              aria-label="View Saved Bookmarks"
              title={`${bookmarks.length} إشارات مرجعية محفوظة`}
              className="relative p-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 text-slate-300 hover:text-indigo-300 transition"
            >
              <FiBookmark size={15} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {bookmarks.length}
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
