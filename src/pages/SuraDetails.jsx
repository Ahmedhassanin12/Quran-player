import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BsFillPlayFill, BsFillPauseFill } from 'react-icons/bs';
import { FiChevronLeft, FiChevronRight, FiBookOpen, FiInfo } from 'react-icons/fi';
import { DetailsHeader, Error, Loader } from '../components';
import {
  useGetSuraAyatQuery,
  useGetChapterIdQuery,
  useGetChapterInfoQuery,
  useGetAllSurahAudioQuery,
} from '../redux/services/quranCore';
import { setActiveSura, playPause } from '../redux/features/playerSlice';

const SuraDetails = () => {
  const { surahId } = useParams();
  const dispatch = useDispatch();

  const numSurahId = Number(surahId);
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const [activeTab, setActiveTab] = useState('verses'); // 'verses' | 'info'
  const [fontSize, setFontSize] = useState('text-2xl'); // 'text-xl' | 'text-2xl' | 'text-3xl'

  const {
    data: chapterData,
    isFetching: isFetchingChapter,
    error: chapterError,
  } = useGetChapterIdQuery(numSurahId);

  const {
    data: versesData,
    isFetching: isFetchingVerses,
    error: versesError,
  } = useGetSuraAyatQuery(numSurahId);

  const {
    data: infoData,
    isFetching: isFetchingInfo,
  } = useGetChapterInfoQuery(numSurahId);

  const reciterId = currentReciter?.id || 7;
  const { data: audioData } = useGetAllSurahAudioQuery(reciterId);

  const isCurrentSurah =
    activeSura &&
    ((activeSura.chapter_id && activeSura.chapter_id === numSurahId) ||
      activeSura.id === numSurahId);

  const isCurrentAndPlaying = isCurrentSurah && isPlaying;

  const handlePlaySurah = () => {
    if (isCurrentAndPlaying) {
      dispatch(playPause(false));
      return;
    }

    if (isCurrentSurah) {
      dispatch(playPause(true));
      return;
    }

    const audioFile = audioData?.audio_files?.find(
      (f) => f.chapter_id === numSurahId,
    );

    const suraObject = {
      ...chapterData?.chapter,
      chapter_id: numSurahId,
      audio_url: audioFile?.audio_url || '',
      reciter_id: reciterId,
    };

    dispatch(
      setActiveSura({
        sura: suraObject,
        i: numSurahId - 1,
        reciter: currentReciter,
      }),
    );
    dispatch(playPause(true));
  };

  if (isFetchingChapter || isFetchingVerses) {
    return <Loader title="Loading Surah verses & info..." />;
  }

  if (chapterError || versesError) {
    return <Error message="Unable to load Surah details. Please check your connection." />;
  }

  const chapter = chapterData?.chapter;
  const verses = versesData?.verses || [];
  const showBismillah = numSurahId !== 1 && numSurahId !== 9;

  return (
    <div className="flex flex-col space-y-6">
      {/* Surah Header Banner */}
      <DetailsHeader chapterData={chapter} />

      {/* Action Bar: Play Button + Surah Navigation + Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-midnight-850/80 border border-midnight-700/80 shadow-md">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePlaySurah}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-950/60 transition-transform transform active:scale-95"
          >
            {isCurrentAndPlaying ? (
              <>
                <BsFillPauseFill size={20} />
                <span>Pause Recitation</span>
              </>
            ) : (
              <>
                <BsFillPlayFill size={20} />
                <span>Play Recitation</span>
              </>
            )}
          </button>

          {/* Quick reciter attribution */}
          <span className="text-xs text-slate-400 hidden md:inline">
            By <strong className="text-slate-200">{currentReciter?.reciter_name}</strong>
          </span>
        </div>

        {/* Previous / Next Surah Shortcuts */}
        <div className="flex items-center space-x-3">
          {numSurahId > 1 && (
            <Link
              to={`/surah/${numSurahId - 1}`}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-midnight-750 hover:bg-midnight-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <FiChevronLeft size={16} />
              <span>Surah {numSurahId - 1}</span>
            </Link>
          )}

          {numSurahId < 114 && (
            <Link
              to={`/surah/${numSurahId + 1}`}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-midnight-750 hover:bg-midnight-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <span>Surah {numSurahId + 1}</span>
              <FiChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Tabs: Verses vs Info */}
      <div className="flex items-center justify-between border-b border-midnight-700 pb-2">
        <div className="flex space-x-3 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('verses')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'verses'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiBookOpen size={16} />
            <span>Verses ({verses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiInfo size={16} />
            <span>Surah Overview & Themes</span>
          </button>
        </div>

        {activeTab === 'verses' && (
          <div className="hidden sm:flex items-center space-x-1 bg-midnight-850 border border-midnight-700 rounded-xl p-1 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setFontSize('text-xl')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'text-xl' ? 'bg-midnight-700 text-white' : ''}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('text-2xl')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'text-2xl' ? 'bg-midnight-700 text-white' : ''}`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('text-3xl')}
              className={`px-2 py-1 rounded-lg ${fontSize === 'text-3xl' ? 'bg-midnight-700 text-white' : ''}`}
            >
              A++
            </button>
          </div>
        )}
      </div>

      {/* Verses Tab Content */}
      {activeTab === 'verses' && (
        <div className="p-6 sm:p-10 rounded-3xl bg-midnight-850/60 border border-midnight-700/60 shadow-xl">
          {/* Bismillah Banner */}
          {showBismillah && (
            <div className="text-center my-6 py-4">
              <p className="font-quran text-3xl sm:text-4xl text-indigo-300 tracking-wide select-none">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent mx-auto mt-3" />
            </div>
          )}

          {/* Ayat Flow with authentic Uthmani Quranic script and verse markers ۝ */}
          <div
            dir="rtl"
            className="leading-[2.8] text-right font-quran text-slate-100 selection:bg-indigo-500/30"
          >
            {verses.map((verse) => (
              <span key={verse.id} className={`${fontSize} inline transition-colors hover:text-indigo-300`}>
                <span>{verse.text_uthmani || verse.text_imlaei}</span>
                <span className="inline-flex items-center justify-center font-sans font-bold text-xs text-indigo-300 mx-2 px-2 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/30 select-none align-middle">
                  {verse.verse_key?.split(':')[1] || verse.verse_number}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info Tab Content */}
      {activeTab === 'info' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-midnight-850/60 border border-midnight-700/60 leading-relaxed text-slate-300 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">
            Historical Context & Revelation
          </h3>
          {infoData?.chapter_info?.short_text && (
            <p className="text-indigo-300/90 font-medium bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-2xl">
              {infoData.chapter_info.short_text}
            </p>
          )}
          {infoData?.chapter_info?.text ? (
            <div
              className="prose prose-invert max-w-none text-slate-300 text-sm leading-7 space-y-3"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: infoData.chapter_info.text }}
            />
          ) : (
            <p className="text-sm text-slate-400">
              No detailed commentary available for this Surah.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SuraDetails;
