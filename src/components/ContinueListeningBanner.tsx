import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillPlayFill } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  setActiveSura,
  playPause,
  setSeekTime,
  selectLastSession,
  selectIsPlaying,
  selectActiveSura,
} from '../redux/features/playerSlice';
import { formatTimeShort } from '../utils/formatters';
import { getLocalizedReciterName, getLocalizedSurahName } from '../utils/quranUtils';
import { normalizeLanguage } from '../i18n';
import type { Surah, AudioFile } from '../types/quran';

export interface ContinueListeningBannerProps {
  allSurahs?: Surah[];
  audioFiles?: AudioFile[] | { audio_files?: AudioFile[] };
}

const ContinueListeningBanner: React.FC<ContinueListeningBannerProps> = ({
  allSurahs,
  audioFiles,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const dispatch = useAppDispatch();
  const lastSession = useAppSelector(selectLastSession);
  const isPlaying = useAppSelector(selectIsPlaying);
  const activeSura = useAppSelector(selectActiveSura);

  if (!lastSession?.activeSura) return null;

  const isCurrentlyPlayingSame = isPlaying && activeSura?.id === lastSession.activeSura.id;
  if (isCurrentlyPlayingSame) return null;

  const surah = lastSession.activeSura;
  const reciter = lastSession.currentReciter;
  const progressSec = lastSession.progressSeconds || 0;
  const surahId = Number(surah.chapter_id || surah.id);

  const handleResume = () => {
    const matchedSura = allSurahs?.find((s) => Number(s.id) === surahId) || surah;

    dispatch(
      setActiveSura({
        sura: matchedSura,
        i: surahId - 1,
        data: allSurahs,
        audioData: audioFiles,
        reciter,
      }),
    );

    if (progressSec > 0) {
      dispatch(setSeekTime(progressSec));
    }
    dispatch(playPause(true));
  };

  const localizedSurahName = getLocalizedSurahName(surah, currentLang);
  const localizedReciterName = getLocalizedReciterName(reciter, currentLang);

  return (
    <div className="rounded-xl px-4 py-2.5 bg-midnight-850/60 border border-midnight-700/60 flex items-center justify-between gap-3 text-xs shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-slate-400 shrink-0">{t('discover.continueListening.label')}:</span>
        <span className="font-semibold text-slate-100 truncate text-sm">
          {localizedSurahName}
        </span>
        {localizedReciterName && (
          <span className="text-slate-500 hidden md:inline truncate">
            · {localizedReciterName}
          </span>
        )}
        {progressSec > 0 && (
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline shrink-0">
            {t('discover.continueListening.atTime', { time: formatTimeShort(progressSec) })}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleResume}
        className="px-3 py-1.5 rounded-lg bg-midnight-750 hover:bg-midnight-700 border border-midnight-600 text-slate-100 font-medium text-xs transition flex items-center gap-1.5 shrink-0"
      >
        <BsFillPlayFill size={14} />
        <span>{t('discover.continueListening.resume')}</span>
      </button>
    </div>
  );
};

export default ContinueListeningBanner;
