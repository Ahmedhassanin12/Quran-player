import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveSura, playPause, setSeekTime } from '../redux/features/playerSlice';
import { SurahMedallion } from './IslamicArtwork';

const formatTime = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ContinueListeningBanner = ({ allSurahs, audioFiles }) => {
  const dispatch = useDispatch();
  const { lastSession, isPlaying, activeSura } = useSelector((state) => state.player);

  if (!lastSession?.activeSura) return null;

  // Don't show if user is currently playing the same surah actively
  const isCurrentlyPlayingSame = isPlaying && activeSura?.id === lastSession.activeSura.id;
  if (isCurrentlyPlayingSame) return null;

  const surah = lastSession.activeSura;
  const reciter = lastSession.currentReciter;
  const progressSec = lastSession.progressSeconds || 0;
  const surahId = surah.chapter_id || surah.id;

  const handleResume = () => {
    // Find matching surah from dataset if available for full playlist context
    const matchedSura = allSurahs?.find((s) => s.id === surahId) || surah;

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
    <div className="relative rounded-lg p-4 bg-gradient-to-r from-indigo-950/60 via-midnight-850 to-midnight-850 border border-indigo-500/40 shadow-xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3.5">
        <SurahMedallion number={surahId} size="md" isPlaying={false} />

        <div>
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              Continue Listening
            </span>
            {progressSec > 0 && (
              <span className="text-[11px] font-mono text-slate-400">
                Paused at {formatTime(progressSec)}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>{surah.name_simple || `Surah ${surahId}`}</span>
            <span className="font-arabic text-indigo-300 font-normal">{surah.name_arabic}</span>
          </h3>

          <p className="text-xs text-slate-400">
            Recitation by <span className="text-slate-300 font-medium">{reciter?.reciter_name}</span>
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center space-x-2">
        <button
          type="button"
          onClick={handleResume}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-950/50 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Resume Recitation
        </button>
      </div>
    </div>
  );
};

export default ContinueListeningBanner;
