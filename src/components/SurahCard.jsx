import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PlayPause from './PlayPause';
import { playPause, setActiveSura } from '../redux/features/playerSlice';
import { SurahMedallion } from './IslamicArtwork';

const SurahCard = ({ sura, isPlaying, activeSura, i, data, audioData, currentReciter }) => {
  const dispatch = useDispatch();

  const isCurrent =
    activeSura &&
    sura &&
    ((activeSura.chapter_id &&
      (sura.chapter_id || sura.id) === activeSura.chapter_id) ||
      activeSura.id === sura.id);

  const isCurrentAndPlaying = isPlaying && isCurrent;

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    dispatch(
      setActiveSura({
        sura,
        i,
        data,
        audioData,
        reciter: currentReciter,
      }),
    );
    dispatch(playPause(true));
  };

  const surahId = sura?.chapter_id || sura?.id || i + 1;
  const revelationPlace = sura?.revelation_place || 'makkah';
  const isMeccan = revelationPlace.toLowerCase() === 'makkah';

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer border ${
        isCurrent
          ? 'bg-midnight-800 border-indigo-500/70 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
          : 'bg-midnight-850 hover:bg-midnight-750 border-midnight-700/80 hover:border-midnight-600 hover:shadow-md'
      }`}
    >
      {/* Top Row: Medallion (Number) + Revelation Badge & Audio Wave + Play/Pause Button */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <SurahMedallion
          number={surahId}
          size="sm"
          isPlaying={isCurrentAndPlaying}
        />

        {/* Center Status: Revelation tag & Playing Wave Badge (NEVER overlapping the button) */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-semibold text-slate-300 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
            {isMeccan ? 'مكية' : 'مدنية'}
          </span>

          {isCurrentAndPlaying && (
            <div className="flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40">
              <span className="playing-bar" />
              <span className="playing-bar" />
              <span className="playing-bar" />
            </div>
          )}
        </div>

        {/* Play / Pause Action Button (Isolated & Accessible) */}
        <div className="shrink-0">
          <PlayPause
            isPlaying={isPlaying}
            activeSura={activeSura}
            sura={sura}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
            size="sm"
          />
        </div>
      </div>

      {/* Middle Row: Full-width Arabic Calligraphy Title (NO truncation, fully visible) */}
      <div className="relative z-10 my-3 text-center">
        <Link
          to={`/surah/${surahId}`}
          onClick={(e) => e.stopPropagation()}
          className="group-hover:text-indigo-300 transition-colors inline-block w-full"
        >
          <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide leading-normal">
            {sura?.name_arabic}
          </h3>
        </Link>
      </div>

      {/* Divider */}
      <div className="relative z-10 my-2 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />

      {/* Bottom Details: English Name + Translation + Verse Count */}
      <div className="relative z-10 flex items-end justify-between pt-1">
        <div className="flex-1 min-w-0 pr-2">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline block"
          >
            <h4 className="font-semibold text-sm text-slate-200 truncate">
              {sura?.name_simple || `Surah ${surahId}`}
            </h4>
          </Link>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {sura?.translated_name?.name || sura?.name_complex || 'The Holy Quran'}
          </p>
        </div>

        <div className="shrink-0">
          <span className="text-[11px] font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-500/25 px-2 py-0.5 rounded-full whitespace-nowrap">
            {sura?.verses_count || sura?.verses?.length || '—'} verses
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurahCard;
