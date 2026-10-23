import React from 'react';
import { useDispatch } from 'react-redux';
import { FiMaximize2 } from 'react-icons/fi';
import { SurahMedallion } from '../IslamicArtwork';
import { toggleExpanded } from '../../redux/features/playerSlice';

const Track = ({ isPlaying, isActive, activeSura, currentReciter }) => {
  const dispatch = useDispatch();

  const surahId = activeSura?.chapter_id || activeSura?.id || 1;
  const nameSimple = activeSura?.name_simple || 'Select a Surah';
  const nameArabic = activeSura?.name_arabic || 'القرآن الكريم';
  const reciterName = currentReciter?.reciter_name || activeSura?.reciter_name || 'Sheikh';

  return (
    <div className="flex items-center space-x-3.5 min-w-[200px] max-w-xs sm:max-w-sm select-none">
      {/* Clickable Medallion Artwork with Expand indicator */}
      <button
        type="button"
        onClick={() => dispatch(toggleExpanded())}
        className="relative group shrink-0 focus:outline-none"
        title="Open expanded player"
      >
        <SurahMedallion
          number={activeSura ? surahId : '۞'}
          size="sm"
          isPlaying={isPlaying && isActive}
        />
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
          <FiMaximize2 size={13} />
        </div>
      </button>

      {/* Track Information */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline space-x-2">
          <p className="font-semibold text-sm text-slate-100 truncate">
            {nameSimple}
          </p>
          <span className="font-arabic font-bold text-sm text-indigo-300 shrink-0">
            {nameArabic}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {reciterName}
        </p>
      </div>
    </div>
  );
};

export default Track;
