import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PlayPause from './PlayPause';
import {
  playPause,
  setActiveSura,
  toggleFavoriteSurah,
} from '../redux/features/playerSlice';
import { SurahMedallion } from './IslamicArtwork';

const SurahCard = ({ sura, isPlaying, activeSura, i, data, audioData, currentReciter }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.player.favorites) || [];

  const surahId = Number(sura?.chapter_id || sura?.id || i + 1);
  const isFavorite = favorites.includes(surahId);

  const isCurrent =
    activeSura &&
    sura &&
    ((activeSura.chapter_id &&
      Number(sura.chapter_id || sura.id) === Number(activeSura.chapter_id)) ||
      Number(activeSura.id) === Number(sura.id));

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

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    dispatch(toggleFavoriteSurah(surahId));
  };

  const revelationPlace = sura?.revelation_place || 'makkah';
  const isMeccan = revelationPlace.toLowerCase() === 'makkah';

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl transition-all duration-200 cursor-pointer border ${
        isCurrent
          ? 'bg-midnight-800 border-indigo-500/70 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
          : 'bg-midnight-850 hover:bg-midnight-750 border-midnight-700/80 hover:border-midnight-600 hover:shadow-md'
      }`}
    >
      {/* Top Row: Medallion (Number) + Revelation & Favorite + Play/Pause Button */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <SurahMedallion
          number={surahId}
          size="sm"
          isPlaying={isCurrentAndPlaying}
        />

        {/* Center Status: Revelation tag & Favorite Bookmark */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-semibold text-slate-300 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
            {isMeccan ? 'مكية' : 'مدنية'}
          </span>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorite
                ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-midnight-700/60'
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
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
      <div className="relative z-10 my-1 text-center">
        <Link
          to={`/surah/${surahId}`}
          onClick={(e) => e.stopPropagation()}
          className="group-hover:text-indigo-300 transition-colors inline-block w-full"
        >
          <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide leading-normal">
            {sura?.name_arabic}
          </h3>
        </Link>
        {isCurrentAndPlaying && (
          <div className="flex items-center justify-center m-auto space-x-0.5 px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 w-[fit-content]">
            <span className="playing-bar" />
            <span className="playing-bar" />
            <span className="playing-bar" />
          </div>
        )}
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
            <h4 className="font-semibold text-sm text-slate-200 leading-tight">
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
