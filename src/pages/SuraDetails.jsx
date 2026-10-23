import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BsFillPlayFill, BsFillPauseFill } from 'react-icons/bs';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiInfo,
  FiRepeat,
  FiLayers,
} from 'react-icons/fi';
import { DetailsHeader, Error, Loader } from '../components';
import {
  useGetChapterIdQuery,
  useGetChapterInfoQuery,
  useGetAllSurahAudioQuery,
  useGetChapterVersesWithTranslationQuery,
  useGetChapterAudioWithSegmentsQuery,
} from '../redux/services/quranCore';
import {
  setActiveSura,
  playPause,
  setSeekTime,
} from '../redux/features/playerSlice';

const SuraDetails = () => {
  const { surahId } = useParams();
  const dispatch = useDispatch();

  const numSurahId = Number(surahId);
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const [activeTab, setActiveTab] = useState('verses'); // 'verses' | 'info'
  const [fontSize, setFontSize] = useState('text-2xl'); // 'text-xl' | 'text-2xl' | 'text-3xl'
  const [showTranslation, setShowTranslation] = useState(true);
  const [viewStyle, setViewStyle] = useState('cards'); // 'cards' | 'continuous'
  const [activeVerseKey, setActiveVerseKey] = useState(null);

  // Hifz Memorization Looping state
  const [isHifzOpen, setIsHifzOpen] = useState(false);
  const [hifzStart, setHifzStart] = useState(1);
  const [hifzEnd, setHifzEnd] = useState(Math.min(5, 7));
  const [hifzTargetLoops, setHifzTargetLoops] = useState(3);
  const [hifzCurrentLoop, setHifzCurrentLoop] = useState(1);
  const [isHifzActive, setIsHifzActive] = useState(false);

  const activeVerseRef = useRef(null);
  const reciterId = currentReciter?.id || 7;

  // 1. Surah chapter metadata
  const {
    data: chapterData,
    isFetching: isFetchingChapter,
    error: chapterError,
  } = useGetChapterIdQuery(numSurahId);

  // 2. Verses with Uthmani script and Saheeh International translation
  const {
    data: versesWithTransData,
    isFetching: isFetchingVerses,
    error: versesError,
  } = useGetChapterVersesWithTranslationQuery({
    chapterId: numSurahId,
    translationId: 20,
  });

  // 3. Audio segment timestamps from Quran.com API v4
  const {
    data: audioSegmentsData,
  } = useGetChapterAudioWithSegmentsQuery({
    reader: reciterId,
    chapterId: numSurahId,
  });

  // 4. Surah overview and commentary
  const {
    data: infoData,
  } = useGetChapterInfoQuery(numSurahId);

  // 5. Surah audio catalog
  const { data: audioData } = useGetAllSurahAudioQuery(reciterId);

  const isCurrentSurah =
    activeSura &&
    ((activeSura.chapter_id && Number(activeSura.chapter_id) === numSurahId) ||
      Number(activeSura.id) === numSurahId);

  const isCurrentAndPlaying = isCurrentSurah && isPlaying;

  const timestamps = useMemo(
    () => audioSegmentsData?.audio_file?.timestamps || [],
    [audioSegmentsData],
  );

  // Map verse keys to timestamp objects
  const timestampMap = useMemo(() => {
    const map = {};
    timestamps.forEach((t) => {
      if (t?.verse_key) {
        map[t.verse_key] = t;
      }
    });
    return map;
  }, [timestamps]);

  // Listen to audio time updates for high-performance verse synchronization
  useEffect(() => {
    if (!isCurrentSurah || timestamps.length === 0) {
      setActiveVerseKey(null);
      return undefined;
    }

    const handleAudioTime = (e) => {
      const currentTimeMs = (e.detail?.currentTime || 0) * 1000;

      // Hifz looping boundary check
      if (isHifzActive) {
        const startKey = `${numSurahId}:${hifzStart}`;
        const endKey = `${numSurahId}:${hifzEnd}`;
        const startTs = timestampMap[startKey];
        const endTs = timestampMap[endKey];

        if (endTs && currentTimeMs >= endTs.timestamp_to) {
          if (hifzCurrentLoop < hifzTargetLoops || hifzTargetLoops === 0) {
            // Loop back to start verse
            setHifzCurrentLoop((prev) => prev + 1);
            if (startTs) {
              dispatch(setSeekTime(startTs.timestamp_from / 1000));
            }
          } else {
            // Completed target loops
            setIsHifzActive(false);
            setHifzCurrentLoop(1);
          }
          return;
        }
      }

      // Find current active verse segment
      const current = timestamps.find(
        (t) => currentTimeMs >= t.timestamp_from && currentTimeMs < t.timestamp_to,
      );

      if (current && current.verse_key !== activeVerseKey) {
        setActiveVerseKey(current.verse_key);
      }
    };

    window.addEventListener('quran-audio-time', handleAudioTime);
    return () => window.removeEventListener('quran-audio-time', handleAudioTime);
  }, [
    isCurrentSurah,
    timestamps,
    activeVerseKey,
    isHifzActive,
    hifzStart,
    hifzEnd,
    hifzCurrentLoop,
    hifzTargetLoops,
    numSurahId,
    timestampMap,
    dispatch,
  ]);

  // Smoothly scroll active verse into view
  useEffect(() => {
    if (activeVerseRef.current && isCurrentAndPlaying && viewStyle === 'cards') {
      activeVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeVerseKey, isCurrentAndPlaying, viewStyle]);

  const handlePlaySurah = () => {
    if (isCurrentAndPlaying) {
      dispatch(playPause(false));
      return;
    }

    if (isCurrentSurah) {
      dispatch(playPause(true));
      return;
    }

    const audioFile =
      audioSegmentsData?.audio_file ||
      audioData?.audio_files?.find((f) => f.chapter_id === numSurahId);

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

  const handleJumpToVerse = (verseKey) => {
    const ts = timestampMap[verseKey];
    if (!ts) return;

    // Start playing this surah if not already playing
    if (!isCurrentSurah) {
      const audioFile =
        audioSegmentsData?.audio_file ||
        audioData?.audio_files?.find((f) => f.chapter_id === numSurahId);

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
    }

    const seekSeconds = ts.timestamp_from / 1000;
    dispatch(setSeekTime(seekSeconds));
    dispatch(playPause(true));
    setActiveVerseKey(verseKey);
  };

  const handleStartHifz = () => {
    setIsHifzActive(true);
    setHifzCurrentLoop(1);

    const startKey = `${numSurahId}:${hifzStart}`;
    const startTs = timestampMap[startKey];

    if (!isCurrentSurah) {
      handlePlaySurah();
    }

    if (startTs) {
      dispatch(setSeekTime(startTs.timestamp_from / 1000));
      dispatch(playPause(true));
    }
  };

  const handleStopHifz = () => {
    setIsHifzActive(false);
    setHifzCurrentLoop(1);
  };

  if (isFetchingChapter || isFetchingVerses) {
    return <Loader title="Loading Surah verses & synchronizing..." />;
  }

  if (chapterError || versesError) {
    return <Error message="Unable to load Surah details. Please check your connection." />;
  }

  const chapter = chapterData?.chapter;
  const verses = versesWithTransData?.verses || [];
  const showBismillah = numSurahId !== 1 && numSurahId !== 9;

  return (
    <div className="flex flex-col space-y-3 pb-8">
      {/* Surah Header Banner */}
      <DetailsHeader chapterData={chapter} />

      {/* Action Bar: Play Button + Surah Navigation + Hifz Mode + Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-midnight-850/80 border border-midnight-700/80 shadow-md">
        <div className="flex items-center space-x-3 w-full md:w-auto">
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

          <span className="text-xs text-slate-400 hidden sm:inline">
            By <strong className="text-slate-200">{currentReciter?.reciter_name}</strong>
          </span>
        </div>

        {/* Center / Right Tools: Hifz Practice Toggle + Navigation */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Hifz Memorization Loop Trigger */}
          <button
            type="button"
            onClick={() => setIsHifzOpen(!isHifzOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isHifzActive || isHifzOpen
                ? 'bg-indigo-600/25 border-indigo-500/60 text-indigo-300'
                : 'bg-midnight-750 hover:bg-midnight-700 border-midnight-700 text-slate-300'
            }`}
          >
            <FiRepeat size={14} className={isHifzActive ? 'animate-spin' : ''} />
            <span>{isHifzActive ? `Hifz Loop (${hifzCurrentLoop}/${hifzTargetLoops || '∞'})` : 'Hifz Practice'}</span>
          </button>

          {/* Previous / Next Surah Shortcuts */}
          <div className="flex items-center space-x-2">
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
      </div>

      {/* Hifz Memorization Control Panel (Expandable) */}
      {isHifzOpen && (
        <div className="p-4 sm:p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-3 animate-slidedown shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-100">Hifz Memorization Looping Mode</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                Memorization Companion
              </span>
            </div>
            {isHifzActive && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Repeating Verses {hifzStart} to {hifzEnd} • Loop {hifzCurrentLoop} of {hifzTargetLoops || '∞'}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Set an Ayah range to automatically repeat for focused memorization and revision with master tajweed.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">From Ayah:</span>
              <input
                type="number"
                min={1}
                max={verses.length}
                value={hifzStart}
                onChange={(e) => setHifzStart(Math.max(1, Math.min(verses.length, Number(e.target.value))))}
                className="w-16 px-2.5 py-1 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-100 text-xs text-center font-bold"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">To Ayah:</span>
              <input
                type="number"
                min={hifzStart}
                max={verses.length}
                value={hifzEnd}
                onChange={(e) => setHifzEnd(Math.max(hifzStart, Math.min(verses.length, Number(e.target.value))))}
                className="w-16 px-2.5 py-1 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-100 text-xs text-center font-bold"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Repeat:</span>
              <select
                value={hifzTargetLoops}
                onChange={(e) => setHifzTargetLoops(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-100 text-xs font-semibold"
              >
                <option value={3}>3 Times</option>
                <option value={5}>5 Times</option>
                <option value={10}>10 Times</option>
                <option value={0}>∞ Infinite Loop</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              {isHifzActive ? (
                <button
                  type="button"
                  onClick={handleStopHifz}
                  className="px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition"
                >
                  Stop Looping
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartHifz}
                  className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition shadow"
                >
                  Start Hifz Repeat
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-midnight-700 pb-2.5 gap-3">
        <div className="flex space-x-2 text-sm">
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
          <div className="flex items-center space-x-2 text-xs">
            {/* View Mode (Cards vs Continuous) */}
            <button
              type="button"
              onClick={() => setViewStyle(viewStyle === 'cards' ? 'continuous' : 'cards')}
              className="px-2.5 py-1.5 rounded-lg bg-midnight-850 hover:bg-midnight-800 border border-midnight-700 text-slate-300 font-medium flex items-center gap-1.5"
            >
              <FiLayers size={13} />
              <span>{viewStyle === 'cards' ? 'Ayah Cards' : 'Continuous Flow'}</span>
            </button>

            {/* Translation Toggle */}
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition ${
                showTranslation
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-midnight-850 border-midnight-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Translation
            </button>

            {/* Font Size Adjusters */}
            <div className="flex items-center space-x-1 bg-midnight-850 border border-midnight-700 rounded-xl p-0.5 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setFontSize('text-xl')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('text-2xl')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-2xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('text-3xl')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-3xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
              >
                A++
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verses Tab Content */}
      {activeTab === 'verses' && (
        <div className="space-y-4">
          {/* Bismillah Banner */}
          {showBismillah && (
            <div className="text-center py-4 bg-midnight-850/40 border border-midnight-700/50 rounded-2xl">
              <p className="font-quran text-3xl sm:text-4xl text-indigo-300 tracking-wide select-none">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* VIEW STYLE A: STRUCTURED AYAH CARDS (WITH SYNC & TRANSLATION) */}
          {viewStyle === 'cards' ? (
            <div className="space-y-3">
              {verses.map((verse) => {
                const isPlayingThisVerse = isCurrentAndPlaying && activeVerseKey === verse.verse_key;
                const translationText = verse.translations?.[0]?.text?.replace(/<sup.*?<\/sup>/g, '') || '';

                return (
                  <div
                    key={verse.id}
                    ref={isPlayingThisVerse ? activeVerseRef : null}
                    onClick={() => handleJumpToVerse(verse.verse_key)}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-right relative group ${
                      isPlayingThisVerse
                        ? 'bg-indigo-950/35 border-indigo-500/80 shadow-xl shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                        : 'bg-midnight-850/60 hover:bg-midnight-800/80 border-midnight-700/60 hover:border-midnight-600'
                    }`}
                  >
                    {/* Header Row: Verse Number Pill + Jump-to-verse trigger */}
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-midnight-700/40 select-none">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
                          {verse.verse_key}
                        </span>
                        {isPlayingThisVerse && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Reciting
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpToVerse(verse.verse_key);
                        }}
                        className="text-xs text-slate-400 group-hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                      >
                        <BsFillPlayFill size={14} />
                        <span>Jump to Ayah</span>
                      </button>
                    </div>

                    {/* Sacred Uthmani Arabic Text */}
                    <p
                      dir="rtl"
                      className={`font-quran ${fontSize} leading-[2.6] text-slate-100 ${
                        isPlayingThisVerse ? 'text-indigo-200' : 'text-slate-100'
                      }`}
                    >
                      {verse.text_uthmani}
                      <span className="inline-flex items-center justify-center font-sans font-bold text-xs text-indigo-400 mx-2 px-2.5 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/30 align-middle">
                        {verse.verse_number}
                      </span>
                    </p>

                    {/* Saheeh International English Translation */}
                    {showTranslation && translationText && (
                      <p
                        dir="ltr"
                        className="text-left text-xs sm:text-sm text-slate-400 font-sans mt-3 pt-3 border-t border-midnight-700/30 leading-relaxed"
                      >
                        {translationText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW STYLE B: CONTINUOUS MUSHAF FLOW */
            <div className="p-6 sm:p-10 rounded-2xl bg-midnight-850/60 border border-midnight-700/60 shadow-xl">
              <div
                dir="rtl"
                className="leading-[2.8] text-right font-quran text-slate-100 selection:bg-indigo-500/30"
              >
                {verses.map((verse) => {
                  const isPlayingThisVerse = isCurrentAndPlaying && activeVerseKey === verse.verse_key;
                  return (
                    <span
                      key={verse.id}
                      onClick={() => handleJumpToVerse(verse.verse_key)}
                      className={`${fontSize} inline transition-all cursor-pointer rounded-lg px-1 ${
                        isPlayingThisVerse
                          ? 'bg-indigo-500/25 text-indigo-200 font-semibold ring-1 ring-indigo-500/50'
                          : 'hover:text-indigo-300 hover:bg-midnight-800/50'
                      }`}
                    >
                      <span>{verse.text_uthmani}</span>
                      <span className="inline-flex items-center justify-center font-sans font-bold text-xs text-indigo-300 mx-1.5 px-2 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/30 select-none align-middle">
                        {verse.verse_number}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Tab Content */}
      {activeTab === 'info' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-midnight-850/60 border border-midnight-700/60 leading-relaxed text-slate-300 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">
            Historical Context & Revelation
          </h3>
          {infoData?.chapter_info?.short_text && (
            <p className="text-indigo-300/90 font-medium bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl">
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
