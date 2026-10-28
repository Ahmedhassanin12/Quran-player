import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BsFillPlayFill } from 'react-icons/bs';
import {
  FiBookOpen,
  FiInfo,
  FiRepeat,
  FiLayers,
} from 'react-icons/fi';
import {
  DetailsHeader,
  Error,
  Loader,
  MushafPageRenderer,
  MushafNavigation,
  MushafBookmarksModal,
} from '../components';
import DownloadSurahButton from '../components/DownloadSurahButton';
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
import {
  getPageForAyah,
  getMushafPageInfo,
} from '../assets/mushafMetadata';
import { storageService } from '../services/storageService';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type {
  MushafBookmark,
  MushafEngine,
  AudioTimestamp,
  AudioFile,
  Verse,
} from '../types';

const toArabicDigits = (num: number | string): string =>
  String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

type ActiveTab = 'verses' | 'info';
type FontSize = 'text-xl' | 'text-2xl' | 'text-3xl';
type ViewStyle = 'mushaf' | 'cards' | 'continuous';

const SuraDetails: React.FC = () => {
  const { surahId } = useParams<{ surahId: string }>();
  const dispatch = useAppDispatch();

  const numSurahId = Number(surahId) || 1;
  const { activeSura, isPlaying, currentReciter } = useAppSelector((state) => state.player);

  const [activeTab, setActiveTab] = useState<ActiveTab>('verses');
  const [fontSize, setFontSize] = useState<FontSize>('text-2xl');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('cards');
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);

  // Authentic Madinah Mushaf State
  const initialMushafPage = useMemo(() => getPageForAyah(numSurahId, 1), [numSurahId]);
  const [mushafPage, setMushafPage] = useState<number>(initialMushafPage);
  const [mushafEngine, setMushafEngine] = useState<MushafEngine>('plate');
  const [mushafBookmarks, setMushafBookmarks] = useState<MushafBookmark[]>(() =>
    storageService.getMushafBookmarks(),
  );
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState<boolean>(false);

  const currentMushafPageInfo = useMemo(() => getMushafPageInfo(mushafPage), [mushafPage]);

  // Hifz Memorization Looping state
  const [isHifzOpen, setIsHifzOpen] = useState<boolean>(false);
  const [hifzStart, setHifzStart] = useState<number>(1);
  const [hifzEnd, setHifzEnd] = useState<number>(Math.min(5, 7));
  const [hifzTargetLoops, setHifzTargetLoops] = useState<number>(3);
  const [hifzCurrentLoop, setHifzCurrentLoop] = useState<number>(1);
  const [isHifzActive, setIsHifzActive] = useState<boolean>(false);

  const activeVerseRef = useRef<HTMLDivElement | null>(null);
  const reciterId = currentReciter?.id || 7;

  // Sync mushafPage when opening a new Surah
  useEffect(() => {
    const target = getPageForAyah(numSurahId, 1);
    setMushafPage(target);
  }, [numSurahId]);

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

  const isCurrentAndPlaying = Boolean(isCurrentSurah && isPlaying);

  const downloadAudioUrl = useMemo<string>(() => {
    const audioFile =
      audioSegmentsData?.audio_file ||
      audioData?.audio_files?.find((f: AudioFile) => Number(f.chapter_id) === numSurahId);
    return audioFile?.audio_url || '';
  }, [audioSegmentsData, audioData, numSurahId]);

  const timestamps = useMemo<AudioTimestamp[]>(
    () => audioSegmentsData?.audio_file?.timestamps || [],
    [audioSegmentsData],
  );

  // Map verse keys to timestamp objects
  const timestampMap = useMemo<Record<string, AudioTimestamp>>(() => {
    const map: Record<string, AudioTimestamp> = {};
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

    const handleAudioTime = (e: Event) => {
      const customEvent = e as CustomEvent<{ currentTime: number }>;
      const currentTimeMs = (customEvent.detail?.currentTime || 0) * 1000;

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

        // Synchronize Mushaf page with reciting Ayah
        const [s, a] = current.verse_key.split(':').map(Number);
        const targetPage = getPageForAyah(s, a);
        if (targetPage && targetPage !== mushafPage) {
          setMushafPage(targetPage);
          storageService.saveLastMushafPage(targetPage);
        }
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
    mushafPage,
    dispatch,
  ]);

  // Smoothly scroll active verse into view in card mode
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
      audioData?.audio_files?.find((f: AudioFile) => f.chapter_id === numSurahId);

    const suraObject = {
      ...chapterData?.chapter,
      id: numSurahId,
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

  const handleJumpToVerse = (verseKey: string) => {
    // Start playing this surah if not already playing
    if (!isCurrentSurah) {
      const audioFile =
        audioSegmentsData?.audio_file ||
        audioData?.audio_files?.find((f: AudioFile) => f.chapter_id === numSurahId);

      const suraObject = {
        ...chapterData?.chapter,
        id: numSurahId,
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

    dispatch(playPause(true));
    setActiveVerseKey(verseKey);

    // Jump to verse page in Mushaf mode
    const [s, a] = verseKey.split(':').map(Number);
    const targetPage = getPageForAyah(s, a);
    if (targetPage) {
      setMushafPage(targetPage);
      storageService.saveLastMushafPage(targetPage);
    }

    // Jump to verse timestamp if available
    const ts = timestampMap[verseKey];
    if (ts && typeof ts.timestamp_from === 'number') {
      const seekSeconds = ts.timestamp_from / 1000;
      dispatch(setSeekTime(seekSeconds));
    }
  };

  const handleToggleBookmark = (
    bookmarkItem: Partial<MushafBookmark> & { verseKey: string; verseNumber?: number; surahId?: number },
  ) => {
    const updated = storageService.toggleMushafBookmark(bookmarkItem);
    setMushafBookmarks(updated);
  };

  const handleSelectBookmark = (bookmark: MushafBookmark) => {
    if (bookmark.pageNumber) {
      setMushafPage(bookmark.pageNumber);
      storageService.saveLastMushafPage(bookmark.pageNumber);
      setViewStyle('mushaf');
      if (bookmark.verseKey) {
        handleJumpToVerse(bookmark.verseKey);
      }
    }
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
    return <Error message="Unable to load Surah recitation details. Please check your connection." />;
  }

  const verses: Verse[] = versesWithTransData?.verses || [];
  const showBismillah = numSurahId !== 1 && numSurahId !== 9;

  return (
    <div className="flex flex-col space-y-2">
      {/* Surah Header Hero */}
      <DetailsHeader
        chapterData={chapterData?.chapter}
        isPlaying={isCurrentAndPlaying}
        onPlayPause={handlePlaySurah}
        reciterName={currentReciter?.reciter_name}
        prevSurahId={numSurahId > 1 ? numSurahId - 1 : null}
        nextSurahId={numSurahId < 114 ? numSurahId + 1 : null}
      />

      {/* Primary Reading & Memorization Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-midnight-850/60 border border-midnight-700/60 shadow-sm">
        {/* Left: Mode Tabs (Verses vs Commentary vs Hifz) */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('verses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'verses'
                ? 'bg-midnight-750 text-white border border-midnight-600 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <FiBookOpen size={13} />
            <span>Verses & Recitation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-midnight-750 text-white border border-midnight-600 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <FiInfo size={13} />
            <span>Surah Info</span>
          </button>

          {/* Hifz Memorization Looping Mode Trigger */}
          <button
            type="button"
            onClick={() => setIsHifzOpen(!isHifzOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              isHifzActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-midnight-800/70 text-slate-300 hover:text-white border-midnight-700/60'
            }`}
          >
            <FiRepeat size={13} />
            <span className="hidden sm:inline">Hifz Looper</span>
            {isHifzActive && (
              <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {hifzCurrentLoop}/{hifzTargetLoops === 0 ? '∞' : hifzTargetLoops}
              </span>
            )}
          </button>

          <DownloadSurahButton
            labelMode="labeled"
            surahId={numSurahId}
            reciterId={reciterId}
            reciterName={currentReciter?.reciter_name || ''}
            surahName={chapterData?.chapter?.name_simple || `Surah ${numSurahId}`}
            arabicName={chapterData?.chapter?.name_arabic || ''}
            audioUrl={downloadAudioUrl}
          />
        </div>

        {/* Right: Reading Mode Controls */}
        {activeTab === 'verses' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Reading Modes: Madinah Mushaf (604 Pages) | Ayah Cards | Continuous Flow */}
            <div className="flex items-center p-1 rounded-lg bg-midnight-900 border border-midnight-700/80 text-xs">
              <button
                type="button"
                onClick={() => setViewStyle('mushaf')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  viewStyle === 'mushaf'
                    ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="المصحف الشريف (طبعة مجمع الملك فهد ٦٠٤ صفحة)"
              >
                <FiBookOpen size={13} />
                <span>المصحف الشريف</span>
              </button>

              <button
                type="button"
                onClick={() => setViewStyle('cards')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  viewStyle === 'cards'
                    ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="بطاقات الآيات مع الترجمة والاستماع"
              >
                <FiLayers size={13} />
                <span>بطاقات الآيات</span>
              </button>

              <button
                type="button"
                onClick={() => setViewStyle('continuous')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  viewStyle === 'continuous'
                    ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="القراءة المتصلة للآيات"
              >
                <span>القراءة المتصلة</span>
              </button>
            </div>

            {/* Translation Toggle (for Cards & Continuous mode) */}
            {viewStyle !== 'mushaf' && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-2.5 py-1.5 rounded-lg border font-medium transition ${
                  showTranslation
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-midnight-800/70 border-midnight-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Translation
              </button>
            )}

            {/* Font Size Adjusters (for Cards & Continuous mode) */}
            {viewStyle !== 'mushaf' && (
              <div className="flex items-center space-x-1 bg-midnight-900 border border-midnight-700/80 rounded-lg p-0.5 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setFontSize('text-xl')}
                  className={`px-2 py-1 rounded-md ${fontSize === 'text-xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('text-2xl')}
                  className={`px-2 py-1 rounded-md ${fontSize === 'text-2xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('text-3xl')}
                  className={`px-2 py-1 rounded-md ${fontSize === 'text-3xl' ? 'bg-midnight-750 text-white font-bold' : ''}`}
                >
                  A++
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hifz Memorization Panel */}
      {isHifzOpen && (
        <div className="p-4 sm:p-5 rounded-xl bg-midnight-900 border border-midnight-700/80 shadow-xl space-y-3 animate-slidedown">
          <div className="flex items-center justify-between pb-2 border-b border-midnight-800">
            <div className="flex items-center space-x-2">
              <FiRepeat className="text-emerald-400" size={16} />
              <h3 className="text-sm font-bold text-slate-100">
                Hifz Verse Memorization Looper
              </h3>
            </div>
            {isHifzActive ? (
              <button
                type="button"
                onClick={handleStopHifz}
                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold"
              >
                Stop Looper
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartHifz}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-950/60"
              >
                Start Memorizing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Start Verse:</label>
              <input
                type="number"
                min="1"
                max={chapterData?.chapter?.verses_count || 1}
                value={hifzStart}
                onChange={(e) => setHifzStart(Number(e.target.value))}
                className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">End Verse:</label>
              <input
                type="number"
                min={hifzStart}
                max={chapterData?.chapter?.verses_count || 1}
                value={hifzEnd}
                onChange={(e) => setHifzEnd(Number(e.target.value))}
                className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Loop Count:</label>
              <select
                value={hifzTargetLoops}
                onChange={(e) => setHifzTargetLoops(Number(e.target.value))}
                className="w-full bg-midnight-800 border border-midnight-700 rounded-lg p-2 text-slate-100"
              >
                <option value="3">3 Repetitions</option>
                <option value="5">5 Repetitions</option>
                <option value="10">10 Repetitions</option>
                <option value="0">Infinite Loop (∞)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Verses Tab Content */}
      {activeTab === 'verses' && (
        <div className="space-y-4">
          {/* ======================================================== */}
          {/* MODE 1: AUTHENTIC MADINAH MUSHAF (EXACT 604-PAGE EDITION) */}
          {/* ======================================================== */}
          {viewStyle === 'mushaf' && (
            <div className="w-full flex flex-col items-center">
              <MushafNavigation
                currentPage={mushafPage}
                pageInfo={currentMushafPageInfo}
                onPageChange={(p) => {
                  setMushafPage(p);
                  storageService.saveLastMushafPage(p);
                }}
                viewEngine={mushafEngine}
                onViewEngineChange={setMushafEngine}
                bookmarks={mushafBookmarks}
                onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
              />

              <MushafPageRenderer
                pageNumber={mushafPage}
                activeVerseKey={activeVerseKey}
                onAyahClick={(vKey) => handleJumpToVerse(vKey)}
                viewEngine={mushafEngine}
                isCurrentAndPlaying={isCurrentAndPlaying}
                bookmarks={mushafBookmarks}
                onToggleBookmark={handleToggleBookmark}
              />

              <MushafBookmarksModal
                isOpen={isBookmarksModalOpen}
                onClose={() => setIsBookmarksModalOpen(false)}
                bookmarks={mushafBookmarks}
                onSelectBookmark={handleSelectBookmark}
                onRemoveBookmark={(vKey) => {
                  const updated = storageService.toggleMushafBookmark({ verseKey: vKey });
                  setMushafBookmarks(updated);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: STRUCTURED AYAH CARDS (WITH SYNC & TRANSLATION)  */}
          {/* ======================================================== */}
          {viewStyle === 'cards' && (
            <>
              {/* Bismillah Banner */}
              {showBismillah && (
                <div className="text-center py-5 bg-midnight-850/40 border border-midnight-700/50 rounded-xl">
                  <p className="font-quran text-3xl sm:text-4xl text-slate-100 tracking-wide select-none">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {verses.map((verse) => {
                  const isPlayingThisVerse = isCurrentAndPlaying && activeVerseKey === verse.verse_key;
                  const translationText = verse.translations?.[0]?.text?.replace(/<sup.*?<\/sup>/g, '') || '';

                  return (
                    <div
                      key={verse.id}
                      ref={isPlayingThisVerse ? activeVerseRef : null}
                      onClick={() => handleJumpToVerse(verse.verse_key)}
                      className={`p-5 sm:p-6 rounded-xl border transition-all duration-200 cursor-pointer text-right relative group ${
                        isPlayingThisVerse
                          ? 'bg-midnight-800/95 border-indigo-500/60 shadow-lg shadow-black/40 ring-1 ring-indigo-500/30'
                          : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
                      }`}
                    >
                      {/* Header Row: Verse Index + Jump-to-verse trigger */}
                      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-midnight-700/30 select-none">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">
                            الآية {toArabicDigits(verse.verse_number)} · <span className="font-mono text-slate-500">{verse.verse_key}</span>
                          </span>
                          {isPlayingThisVerse && (
                            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              يتلو الآن
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
                          <BsFillPlayFill size={15} />
                          <span>استماع</span>
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
                        <span className="font-arabic text-amber-400/90 font-normal mx-2 select-none text-[0.85em] align-middle">
                          ﴿{toArabicDigits(verse.verse_number)}﴾
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
            </>
          )}

          {/* ======================================================== */}
          {/* MODE 3: CONTINUOUS MUSHAF FLOW                          */}
          {/* ======================================================== */}
          {viewStyle === 'continuous' && (
            <>
              {/* Bismillah Banner */}
              {showBismillah && (
                <div className="text-center py-5 bg-midnight-850/40 border border-midnight-700/50 rounded-xl">
                  <p className="font-quran text-3xl sm:text-4xl text-slate-100 tracking-wide select-none">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              <div className="p-6 sm:p-10 rounded-xl bg-midnight-850/60 border border-midnight-700/60 shadow-xl">
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
                        className={`${fontSize} inline transition-all cursor-pointer rounded px-1 ${
                          isPlayingThisVerse
                            ? 'bg-indigo-500/20 text-indigo-200 font-medium ring-1 ring-indigo-500/40'
                            : 'hover:text-indigo-300 hover:bg-midnight-800/40'
                        }`}
                      >
                        <span>{verse.text_uthmani}</span>
                        <span className="font-arabic text-amber-400/90 font-normal mx-1.5 select-none text-[0.8em] align-middle">
                          ﴿{toArabicDigits(verse.verse_number)}﴾
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info Tab Content */}
      {activeTab === 'info' && (
        <div className="p-6 sm:p-8 rounded-xl bg-midnight-850/60 border border-midnight-700/60 leading-relaxed text-slate-300 space-y-4">
          <h3 className="text-lg font-bold text-slate-100">
            Historical Context & Revelation
          </h3>
          {infoData?.chapter_info?.short_text && (
            <p className="text-indigo-300/90 font-medium bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-lg">
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
