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
      className={`group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 cursor-pointer border ${
        isCurrent
          ? 'bg-gradient-to-br from-charcoal-800 to-emerald-950/40 border-emerald-500/50 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
          : 'bg-charcoal-850/80 hover:bg-charcoal-800/90 border-charcoal-700/60 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      {/* Background subtle Islamic pattern */}
      <div className="absolute inset-0 rounded-2xl opacity-5 bg-islamic-pattern pointer-events-none" />

      {/* Top row: Medallion + Arabic Name + Play/Pause Button */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <SurahMedallion
          number={surahId}
          size="sm"
          isPlaying={isCurrentAndPlaying}
        />

        <div className="flex-1 min-w-0 text-right">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="group-hover:text-emerald-300 transition-colors inline-block max-w-full"
          >
            <h3 className="font-arabic text-xl sm:text-2xl font-bold text-slate-100 tracking-wide truncate">
              {sura?.name_arabic}
            </h3>
          </Link>
          <p className="text-xs text-gold-400/80 font-medium mt-0.5 truncate">
            {isMeccan ? 'مكية • Meccan' : 'مدنية • Medinan'}
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

      {/* Divider */}
      <div className="relative z-10 my-4 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />

      {/* Bottom details: English Name + Translation + Verse Count */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline"
          >
            <h4 className="font-semibold text-sm text-slate-200 truncate">
              {sura?.name_simple || `Surah ${surahId}`}
            </h4>
          </Link>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {sura?.translated_name?.name || sura?.name_complex || 'The Holy Quran'}
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-1 text-right">
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {sura?.verses_count || sura?.verses?.length || '—'} verses
          </span>
        </div>
      </div>

      {/* Active Audio Wave Indicator on playing card */}
      {isCurrentAndPlaying && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 pointer-events-none">
          <span className="playing-bar" />
          <span className="playing-bar" />
          <span className="playing-bar" />
          <span className="playing-bar" />
        </div>
      )}
    </div>
  );
};

export default SurahCard;
