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

  const handleOpenExpanded = () => {
    dispatch(toggleExpanded());
  };

  return (
    <div
      onClick={handleOpenExpanded}
      className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1 sm:flex-initial sm:w-60 lg:w-72 max-w-[48%] sm:max-w-sm select-none cursor-pointer group"
      title="Tap to open full player"
    >
      {/* Clickable Medallion Artwork with Expand indicator */}
      <div className="relative shrink-0">
        <SurahMedallion
          number={activeSura ? surahId : '۞'}
          size="sm"
          isPlaying={isPlaying && isActive}
        />
        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
          <FiMaximize2 size={13} />
        </div>
      </div>

      {/* Track Information */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline space-x-1.5 sm:space-x-2">
          <p className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
            {nameSimple}
          </p>
          <span className="font-arabic font-bold text-xs sm:text-sm text-indigo-300 shrink-0 hidden xs:inline">
            {nameArabic}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
          {reciterName}
        </p>
      </div>
    </div>
  );
};

export default Track;
