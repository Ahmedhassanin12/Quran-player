import React from 'react';
import type { IconType } from 'react-icons';
import {
  FiSun,
  FiMoon,
  FiShield,
  FiHeart,
  FiBookOpen,
  FiPlay,
  FiX,
} from 'react-icons/fi';
import { useAppDispatch } from '../redux/hooks';
import { CURATED_COLLECTIONS } from '../assets/collectionsData';
import { setActiveSura, playPause } from '../redux/features/playerSlice';
import type { Surah, AudioFile } from '../types/quran';
import type { Reciter } from '../types/reciter';
import type { CuratedCollection } from '../types/collections';

const COLLECTION_ICONS: Record<string, IconType> = {
  sun: FiSun,
  moon: FiMoon,
  shield: FiShield,
  heart: FiHeart,
  'book-open': FiBookOpen,
};

export interface CuratedCollectionsProps {
  onSelectCollection: (id: string | null) => void;
  selectedCollectionId: string | null;
  allSurahs?: Surah[];
  audioFiles?: AudioFile[] | { audio_files?: AudioFile[] };
  currentReciter?: Reciter;
}

const CuratedCollections: React.FC<CuratedCollectionsProps> = ({
  onSelectCollection,
  selectedCollectionId,
  allSurahs,
  audioFiles,
  currentReciter,
}) => {
  const dispatch = useAppDispatch();

  const activeCollection = CURATED_COLLECTIONS.find(
    (c) => c.id === selectedCollectionId,
  );

  const handlePlayCollection = (e: React.MouseEvent, collection: CuratedCollection) => {
    e.stopPropagation();
    if (!allSurahs || allSurahs.length === 0) return;

    const collectionSurahs = allSurahs.filter((s) =>
      collection.surahIds.includes(Number(s.id)),
    );
    if (collectionSurahs.length === 0) return;

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
    <div className="py-1">
      {/* Editorial Pill Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0 pl-0.5">
          مجموعات السور:
        </span>

        {CURATED_COLLECTIONS.map((col) => {
          const isSelected = selectedCollectionId === col.id;
          const IconComponent = COLLECTION_ICONS[col.icon] || FiBookOpen;

          return (
            <button
              type="button"
              key={col.id}
              onClick={() => onSelectCollection(isSelected ? null : col.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 border ${
                isSelected
                  ? 'bg-midnight-800 text-slate-100 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-midnight-850/60 hover:bg-midnight-800/80 border-midnight-700/60 text-slate-300 hover:text-slate-100'
              }`}
            >
              <IconComponent
                size={13}
                className={isSelected ? 'text-indigo-400' : 'text-slate-400'}
              />
              <span className="font-arabic">{col.arabic_title}</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">
                ({col.title})
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-midnight-900/60 px-1.5 py-0.5 rounded">
                {col.surahIds.length}
              </span>
            </button>
          );
        })}

        {/* Clear Filter action when active */}
        {selectedCollectionId && (
          <button
            type="button"
            onClick={() => onSelectCollection(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-midnight-850/40 hover:bg-midnight-800 border border-midnight-700/50 transition shrink-0"
            title="عرض الكل / Show all surahs"
          >
            <FiX size={13} />
            <span>عرض الكل</span>
          </button>
        )}
      </div>

      {/* When a collection is actively selected, show a subtle contextual banner with its citation and play button */}
      {activeCollection && (
        <div className="mt-2 px-4 py-2.5 rounded-xl bg-midnight-850/40 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-slate-100 font-arabic">
                {activeCollection.arabic_title}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{activeCollection.description}</span>
            </div>
            {activeCollection.citation && (
              <p className="text-[11px] text-indigo-300/80 mt-0.5 font-medium">
                {activeCollection.citation}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => handlePlayCollection(e, activeCollection)}
              className="px-3 py-1.5 rounded-lg bg-midnight-750 hover:bg-midnight-700 border border-midnight-600 text-slate-100 font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <FiPlay size={12} className="fill-current" />
              <span>تشغيل المجموعة ({activeCollection.surahIds.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratedCollections;
