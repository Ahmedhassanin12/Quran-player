import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CURATED_COLLECTIONS } from '../assets/collectionsData';
import { setActiveSura, playPause } from '../redux/features/playerSlice';

const CuratedCollections = ({ onSelectCollection, selectedCollectionId, allSurahs, audioFiles, currentReciter }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handlePlayCollection = (e, collection) => {
    e.stopPropagation();
    if (!allSurahs || allSurahs.length === 0) return;

    // Filter surahs belonging to collection
    const collectionSurahs = allSurahs.filter((s) => collection.surahIds.includes(s.id));
    if (collectionSurahs.length === 0) return;

    // Start with first surah of collection
    dispatch(
      setActiveSura({
        sura: collectionSurahs[0],
        i: 0,
        data: collectionSurahs,
        audioData: audioFiles,
        reciter: currentReciter,
      }),
    );
    dispatch(playPause(true));
  };

  return (
    <div className="space-y-3">
      {/* Shelf Header with Title & Scroll Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-sm font-bold text-slate-100 tracking-wide">
            Sunnah & Thematic Collections
          </span>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
            Curated
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {selectedCollectionId && (
            <button
              type="button"
              onClick={() => onSelectCollection(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mr-2 transition"
            >
              Clear Filter (Show All)
            </button>
          )}

          {/* Left / Right Scroll Buttons */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-sm"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700/80 text-slate-300 hover:text-white flex items-center justify-center transition shadow-sm"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Spacious Horizontal Shelf (Never Shrinks) */}
      <div
        ref={scrollRef}
        className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-none select-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CURATED_COLLECTIONS.map((col) => {
          const isSelected = selectedCollectionId === col.id;
          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(isSelected ? null : col.id)}
              className={`w-64 sm:w-72 shrink-0 p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-md ${
                isSelected
                  ? 'bg-indigo-950/50 border-indigo-500/80 shadow-indigo-950/60 ring-1 ring-indigo-500/40'
                  : 'bg-midnight-850 hover:bg-midnight-800 border-midnight-700/70 hover:border-midnight-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{col.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-300 bg-midnight-800 border border-midnight-700 px-2 py-0.5 rounded-full">
                      {col.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                      Active Filter
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {col.title}
                </h4>

                <p className="text-xs font-arabic text-indigo-300/80 mt-0.5 font-medium">
                  {col.arabic_title}
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-midnight-700/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 font-mono">
                  {col.surahIds.length} {col.surahIds.length === 1 ? 'Surah' : 'Surahs'}
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePlayCollection(e, col)}
                  aria-label={`Play ${col.title}`}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-950/50"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CuratedCollections;
