import React from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { FiTrash2, FiBookmark } from 'react-icons/fi';
import { BsFillPlayFill } from 'react-icons/bs';

const MushafBookmarksModal = ({
  isOpen,
  onClose,
  bookmarks = [],
  onSelectBookmark,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-slowfade select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-midnight-900 border border-midnight-700/80 rounded-xl p-5 sm:p-6 shadow-2xl text-right overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-midnight-700/70">
          <div className="flex items-center space-x-2 space-x-reverse text-indigo-400 font-arabic font-bold text-base">
            <FiBookmark size={18} />
            <span>الإشارات المرجعية المحفوظة</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-midnight-800 transition"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* List of bookmarks */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1 hide-scrollbar">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FiBookmark size={32} className="mx-auto text-slate-600 opacity-60" />
              <p className="text-xs font-arabic">لا توجد إشارات مرجعية محفوظة بعد.</p>
              <p className="text-[11px] text-slate-500">
                اضغط على أي آية في المصحف لحفظها هنا والعودة إليها لاحقاً.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.verseKey}
                onClick={() => {
                  onSelectBookmark(b);
                  onClose();
                }}
                className="p-3.5 rounded-lg bg-midnight-850 hover:bg-midnight-800 border border-midnight-750 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group shadow-sm"
              >
                <div className="text-right">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="font-bold text-sm text-slate-100 font-arabic">
                      سورة {b.surahName || 'القرآن'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-indigo-400 bg-midnight-800 px-2 py-0.5 rounded-md border border-midnight-700">
                      آية {b.verseKey}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    صفحة {b.pageNumber}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(b.verseKey);
                    }}
                    title="حذف الإشارة"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MushafBookmarksModal;
