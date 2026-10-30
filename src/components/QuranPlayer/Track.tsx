import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiMaximize2 } from 'react-icons/fi';
import { SurahMedallion } from '../IslamicArtwork';
import { useAppDispatch } from '../../redux/hooks';
import { toggleExpanded } from '../../redux/features/playerSlice';
import { getLocalizedReciterName, getLocalizedSurahName } from '../../utils/quranUtils';
import { normalizeLanguage } from '../../i18n';
import type { Surah } from '../../types/quran';
import type { Reciter } from '../../types/reciter';

export interface TrackProps {
  isPlaying?: boolean;
  isActive?: boolean;
  activeSura?: Surah | null;
  currentReciter?: Reciter | null;
}

const Track: React.FC<TrackProps> = ({ isPlaying = false, isActive = false, activeSura, currentReciter }) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const dispatch = useAppDispatch();

  const surahId = activeSura?.chapter_id || activeSura?.id || 1;
  const localizedSurahName = activeSura
    ? getLocalizedSurahName(activeSura, currentLang)
    : t('player.selectSurah');
  const arabicName = activeSura?.name_arabic || '';
  const localizedReciterName = getLocalizedReciterName(currentReciter || activeSura, currentLang);

  const handleOpenExpanded = () => {
    dispatch(toggleExpanded());
  };

  return (
    <div
      onClick={handleOpenExpanded}
      className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial sm:w-60 lg:w-72 max-w-[48%] sm:max-w-sm select-none cursor-pointer group"
      title={t('player.tapToExpand')}
    >
      {/* Clickable Medallion Artwork with Expand indicator */}
      <div className="hidden sm:block relative shrink-0">
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
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
            {localizedSurahName}
          </p>
          {arabicName && currentLang !== 'ar' && (
            <span className="font-arabic font-bold text-xs sm:text-sm text-indigo-300 shrink-0 hidden xs:inline" lang="ar" dir="rtl">
              {arabicName}
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
          {localizedReciterName}
        </p>
      </div>
    </div>
  );
};

export default Track;
