import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { playPause, setActiveSura, setReciter } from '../redux/features/playerSlice';
import PlayPause from './PlayPause';
import { SurahMedallion, ReciterAvatar } from './IslamicArtwork';
import { VERIFIED_RECITERS } from '../assets/recitersData';
import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from '../redux/services/quranCore';

const RECOMMENDED_SURAH_IDS = [1, 18, 36, 55, 56, 67];

const TopPlay = () => {
  const dispatch = useDispatch();
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const reciterId = currentReciter?.id || 7;
  const { data: chaptersData } = useGetAllChaptersQuery();
  const { data: audioData } = useGetAllSurahAudioQuery(reciterId);

  // Audio map by chapter_id
  const audioMap = useMemo(() => {
    const map = {};
    if (audioData?.audio_files && Array.isArray(audioData.audio_files)) {
      audioData.audio_files.forEach((file) => {
        if (file?.chapter_id) {
          map[file.chapter_id] = file;
        }
      });
    }
    return map;
  }, [audioData]);

  // Curated list of recommended surahs with audio attached
  const recommendedList = useMemo(() => {
    if (!chaptersData?.chapters) return [];
    return RECOMMENDED_SURAH_IDS.map((id) => {
      const chapter = chaptersData.chapters.find((c) => c.id === id);
      const audio = audioMap[id];
      if (!chapter) return null;
      return {
        ...chapter,
        audio_url: audio?.audio_url || '',
        chapter_id: id,
        reciter_id: reciterId,
      };
    }).filter(Boolean);
  }, [chaptersData, audioMap, reciterId]);

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = (sura, index) => {
    dispatch(
      setActiveSura({
        sura,
        i: index,
        data: recommendedList,
        reciter: currentReciter,
      }),
    );
    dispatch(playPause(true));
  };

  const featuredReciters = VERIFIED_RECITERS.slice(0, 4);

  return (
    <div className="flex flex-col space-y-5 select-none w-full">
      {/* Featured Reciters Quick Switch Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-midnight-850/90 border border-midnight-700/80 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Featured Reciters
          </h3>
          <Link
            to="/top-reciters"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            All (12) →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {featuredReciters.map((reciter) => {
            const isSelected = currentReciter?.id === reciter.id;
            return (
              <button
                type="button"
                key={reciter.id}
                onClick={() => dispatch(setReciter(reciter))}
                className={`flex items-center space-x-2 p-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-midnight-800 border border-indigo-500/50 shadow-sm'
                    : 'bg-midnight-800/60 hover:bg-midnight-800 border border-midnight-700/50 text-slate-300'
                }`}
              >
                <ReciterAvatar
                  photoUrl={reciter.photo_url}
                  name={reciter.reciter_name}
                  arabicName={reciter.arabic_name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-slate-200">
                    {reciter.reciter_name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-indigo-300/90 font-arabic truncate">
                    {reciter.arabic_name ? reciter.arabic_name.split(' ').slice(0, 2).join(' ') : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Surahs Card List */}
      <div className="p-4 sm:p-5 rounded-2xl bg-midnight-850/90 border border-midnight-700/80 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recommended Surahs
          </h3>
          <span className="text-[11px] text-indigo-300/80 font-medium">سُوَرٌ مُبَارَكَة</span>
        </div>

        <div className="flex flex-col space-y-2">
          {recommendedList.map((sura, idx) => {
            const isCurrent =
              activeSura &&
              ((activeSura.chapter_id && activeSura.chapter_id === sura.id) ||
                activeSura.id === sura.id);

            return (
              <div
                key={sura.id}
                onClick={() => handlePlayClick(sura, idx)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-midnight-800 border-indigo-500/50 shadow-sm'
                    : 'bg-midnight-800/40 hover:bg-midnight-800 border-midnight-700/40'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <SurahMedallion
                    number={sura.id}
                    size="sm"
                    isPlaying={isCurrent && isPlaying}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {sura.name_simple}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {sura.translated_name?.name || 'Surah'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-arabic text-xs text-indigo-300 font-bold hidden sm:inline">
                    {sura.name_arabic}
                  </span>
                  <PlayPause
                    isPlaying={isPlaying}
                    activeSura={activeSura}
                    sura={sura}
                    handlePause={handlePauseClick}
                    handlePlay={() => handlePlayClick(sura, idx)}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopPlay;
