import React from 'react';
import { useDispatch } from 'react-redux';
import { CURATED_COLLECTIONS } from '../assets/collectionsData';
import { setActiveSura, playPause } from '../redux/features/playerSlice';

const CuratedCollections = ({ onSelectCollection, selectedCollectionId, allSurahs, audioFiles, currentReciter }) => {
  const dispatch = useDispatch();

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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-200">Sunnah & Thematic Collections</span>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
            Curated
          </span>
        </div>
        {selectedCollectionId && (
          <button
            type="button"
            onClick={() => onSelectCollection(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {CURATED_COLLECTIONS.map((col) => {
          const isSelected = selectedCollectionId === col.id;
          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(isSelected ? null : col.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                  : 'bg-midnight-850/80 hover:bg-midnight-800 border-midnight-700/70 hover:border-midnight-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base">{col.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-midnight-800 border border-midnight-700 px-2 py-0.5 rounded-full">
                    {col.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {col.title}
                </h4>
                <p className="text-xs font-arabic text-slate-400 mt-0.5 line-clamp-1">
                  {col.arabic_title}
                </p>
                <p className="text-[11px] text-slate-400/90 mt-1 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-midnight-700/50 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {col.surahIds.length} {col.surahIds.length === 1 ? 'Surah' : 'Surahs'}
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePlayCollection(e, col)}
                  aria-label={`Play ${col.title}`}
                  className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-[11px] font-semibold transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
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
