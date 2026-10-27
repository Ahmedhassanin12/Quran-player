import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PlayPause from './PlayPause';
import DownloadSurahButton from './DownloadSurahButton';
import {
  playPause,
  setActiveSura,
  toggleFavoriteSurah,
} from '../redux/features/playerSlice';

const toArabicDigits = (num) => String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

const SurahCard = ({
  sura,
  isPlaying,
  activeSura,
  i,
  data,
  audioData,
  currentReciter,
  viewMode = 'grid',
}) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.player.favorites) || [];

  const surahId = Number(sura?.chapter_id || sura?.id || i + 1);
  const isFavorite = favorites.includes(surahId);
  const reciterId = Number(sura?.reciter_id || currentReciter?.id || 0);
  const effectiveReciterName = sura?.reciter_name || currentReciter?.reciter_name || '';

  const audioUrl = useMemo(() => {
    if (sura?.audio_url) return sura.audio_url;
    const files = Array.isArray(audioData) ? audioData : audioData?.audio_files;
    const match = files?.find((f) => Number(f.chapter_id) === surahId);
    return match?.audio_url || '';
  }, [sura?.audio_url, audioData, surahId]);

  const isCurrent = activeSura
    && sura
    && ((activeSura.chapter_id
      && Number(sura.chapter_id || sura.id) === Number(activeSura.chapter_id))
      || Number(activeSura.id) === Number(sura.id));

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
  const versesCount = sura?.verses_count || sura?.verses?.length || 0;

  // ==========================================
  // VIEW MODE: LIST ROW (Sleek Horizontal Tile)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        onClick={handlePlayClick}
        className={`group flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
          isCurrent
            ? 'bg-midnight-800/95 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
            : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
        }`}
      >
        {/* Left: Number + Play + Latin Metadata */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <span className="font-mono text-xs font-semibold text-slate-400 w-7 shrink-0">
            {String(surahId).padStart(3, '0')}
          </span>

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

          <div className="min-w-0">
            <Link
              to={`/surah/${surahId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              <h4 className="font-semibold text-sm text-slate-200 truncate">
                {sura?.name_simple || `Surah ${surahId}`}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-400 truncate">
              {sura?.translated_name?.name || sura?.name_complex || 'The Holy Quran'}
            </p>
          </div>
        </div>

        {/* Center: Revelation Metadata */}
        <div className="hidden sm:flex items-center text-xs text-slate-400 font-medium space-x-1.5 shrink-0 px-4">
          <span>{isMeccan ? 'مكية' : 'مدنية'}</span>
          <span className="text-slate-600">·</span>
          <span>{versesCount} آية</span>
        </div>

        {/* Right: Sacred Arabic Title + Download + Favorite Action */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-indigo-300 transition-colors"
          >
            <span className="font-arabic text-xl sm:text-2xl font-bold text-slate-100">
              سورة {sura?.name_arabic}
            </span>
          </Link>

          <DownloadSurahButton
            size="sm"
            surahId={surahId}
            reciterId={reciterId}
            reciterName={effectiveReciterName}
            surahName={sura?.name_simple || `Surah ${surahId}`}
            arabicName={sura?.name_arabic || ''}
            audioUrl={audioUrl}
          />

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite
                ? 'text-rose-400 bg-rose-500/10'
                : 'text-slate-500 hover:text-slate-300'
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
      </div>
    );
  }

  // ==========================================
  // VIEW MODE: GRID CARD (Editorial Manuscript)
  // ==========================================
  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex flex-col justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
        isCurrent
          ? 'bg-midnight-800/95 border-indigo-500/60 shadow-lg shadow-black/40 ring-1 ring-indigo-500/30'
          : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
      }`}
    >
      {/* Top Bar: Clean Discrete Number & Metadata + Download + Favorite Action */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-mono font-semibold text-slate-300">
            {String(surahId).padStart(3, '0')}
          </span>
          <span className="text-slate-600">·</span>
          <span>{isMeccan ? 'مكية' : 'مدنية'}</span>
          <span className="text-slate-600">·</span>
          <span>{toArabicDigits(versesCount)} آية</span>
        </div>

        <div className="flex items-center gap-1">
          <DownloadSurahButton
            size="sm"
            className="opacity-70 group-hover:opacity-100"
            surahId={surahId}
            reciterId={reciterId}
            reciterName={effectiveReciterName}
            surahName={sura?.name_simple || `Surah ${surahId}`}
            arabicName={sura?.name_arabic || ''}
            audioUrl={audioUrl}
          />

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
            className={`p-1 rounded-lg transition-colors ${
              isFavorite
                ? 'text-rose-400 bg-rose-500/10'
                : 'text-slate-500 hover:text-slate-300 opacity-60 group-hover:opacity-100'
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
      </div>

      {/* Middle: Majestic Sacred Arabic Calligraphy Title */}
      <div className="relative z-10 my-3.5 text-center">
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
          <div className="flex items-center justify-center m-auto space-x-0.5 px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 w-[fit-content] mt-1">
            <span className="playing-bar" />
            <span className="playing-bar" />
            <span className="playing-bar" />
          </div>
        )}
      </div>

      {/* Bottom Row: Latin Name & Subtitle + Play/Pause Action */}
      <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-midnight-700/30">
        <div className="flex-1 min-w-0 pr-2">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline block"
          >
            <h4 className="font-semibold text-xs sm:text-sm text-slate-200 leading-tight truncate">
              {sura?.name_simple || `Surah ${surahId}`}
            </h4>
          </Link>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {sura?.translated_name?.name || sura?.name_complex || 'The Holy Quran'}
          </p>
        </div>

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
    </div>
  );
};

export default SurahCard;
