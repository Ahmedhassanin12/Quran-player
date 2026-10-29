import React from 'react';
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
import type { Surah, AudioFile } from '../types/quran';

export interface ContinueListeningBannerProps {
  allSurahs?: Surah[];
  audioFiles?: AudioFile[] | { audio_files?: AudioFile[] };
}

const ContinueListeningBanner: React.FC<ContinueListeningBannerProps> = ({
  allSurahs,
  audioFiles,
}) => {
  const dispatch = useAppDispatch();
  const lastSession = useAppSelector(selectLastSession);
  const isPlaying = useAppSelector(selectIsPlaying);
  const activeSura = useAppSelector(selectActiveSura);

  if (!lastSession?.activeSura) return null;

  // Don't show if user is currently playing the same surah actively
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

  return (
    <div className="rounded-xl px-4 py-2.5 bg-midnight-850/60 border border-midnight-700/60 flex items-center justify-between gap-3 text-xs shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-slate-400">متابعة التلاوة:</span>
        <span className="font-semibold text-slate-100 font-arabic truncate text-sm">
          سورة {surah.name_arabic}
        </span>
        <span className="text-slate-400 text-xs hidden sm:inline">
          ({surah.name_simple})
        </span>
        <span className="text-slate-500 hidden md:inline">· {reciter?.reciter_name}</span>
        {progressSec > 0 && (
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">
            عند {formatTimeShort(progressSec)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleResume}
        className="px-3 py-1.5 rounded-lg bg-midnight-750 hover:bg-midnight-700 border border-midnight-600 text-slate-100 font-medium text-xs transition flex items-center gap-1.5 shrink-0"
      >
        <BsFillPlayFill size={14} />
        <span>استئناف</span>
      </button>
    </div>
  );
};

export default ContinueListeningBanner;
