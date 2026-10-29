import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  HifzLooperPanel,
  SuraCardsView,
  SuraContinuousView,
  SuraInfoTab,
} from '../components/SuraDetails';
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
  selectActiveSura,
  selectIsPlaying,
  selectCurrentReciter,
} from '../redux/features/playerSlice';
import {
  getPageForAyah,
  getMushafPageInfo,
} from '../assets/mushafMetadata';
import { storageService } from '../services/storageService';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useAyahAudioSync } from '../hooks/useAyahAudioSync';
import type {
  MushafBookmark,
  MushafEngine,
  AudioTimestamp,
  AudioFile,
  Verse,
} from '../types';

type ActiveTab = 'verses' | 'info';
type FontSize = 'text-xl' | 'text-2xl' | 'text-3xl';
type ViewStyle = 'mushaf' | 'cards' | 'continuous';

const SuraDetails: React.FC = () => {
  const { surahId } = useParams<{ surahId: string }>();
  const dispatch = useAppDispatch();

  const numSurahId = Number(surahId) || 1;
  const activeSura = useAppSelector(selectActiveSura);
  const isPlaying = useAppSelector(selectIsPlaying);
  const currentReciter = useAppSelector(selectCurrentReciter);

  const [activeTab, setActiveTab] = useState<ActiveTab>('verses');
  const [fontSize, setFontSize] = useState<FontSize>('text-2xl');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('cards');

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

  const isCurrentSurah = Boolean(
    activeSura &&
    ((activeSura.chapter_id && Number(activeSura.chapter_id) === numSurahId) ||
      Number(activeSura.id) === numSurahId),
  );

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

  // High-performance verse audio synchronization and Hifz loop control
  const handleSeekToVerseTime = useCallback((seconds: number) => {
    dispatch(setSeekTime(seconds));
  }, [dispatch]);

  const handleLoopStep = useCallback(() => {
    setHifzCurrentLoop((prev) => prev + 1);
  }, []);

  const handleLoopComplete = useCallback(() => {
    setIsHifzActive(false);
    setHifzCurrentLoop(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setMushafPage(page);
  }, []);

  const { activeVerseKey, setActiveVerseKey } = useAyahAudioSync({
    isCurrentSurah,
    timestamps,
    timestampMap,
    isHifzActive,
    hifzStart,
    hifzEnd,
    hifzCurrentLoop,
    hifzTargetLoops,
    numSurahId,
    mushafPage,
    onSeekToVerseTime: handleSeekToVerseTime,
    onLoopStep: handleLoopStep,
    onLoopComplete: handleLoopComplete,
    onPageChange: handlePageChange,
  });

  const handlePlaySurah = useCallback(() => {
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
  }, [
    isCurrentAndPlaying,
    isCurrentSurah,
    audioSegmentsData?.audio_file,
    audioData?.audio_files,
    chapterData?.chapter,
    numSurahId,
    reciterId,
    currentReciter,
    dispatch,
  ]);

  const handleJumpToVerse = useCallback((verseKey: string) => {
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

    const [s, a] = verseKey.split(':').map(Number);
    const targetPage = getPageForAyah(s, a);
    if (targetPage) {
      setMushafPage(targetPage);
      storageService.saveLastMushafPage(targetPage);
    }

    const ts = timestampMap[verseKey];
    if (ts && typeof ts.timestamp_from === 'number') {
      const seekSeconds = ts.timestamp_from / 1000;
      dispatch(setSeekTime(seekSeconds));
    }
  }, [
    isCurrentSurah,
    audioSegmentsData?.audio_file,
    audioData?.audio_files,
    chapterData?.chapter,
    numSurahId,
    reciterId,
    currentReciter,
    dispatch,
    setActiveVerseKey,
    timestampMap,
  ]);

  const handleToggleBookmark = useCallback((
    bookmarkItem: Partial<MushafBookmark> & { verseKey: string; verseNumber?: number; surahId?: number },
  ) => {
    const updated = storageService.toggleMushafBookmark(bookmarkItem);
    setMushafBookmarks(updated);
  }, []);

  const handleSelectBookmark = useCallback((bookmark: MushafBookmark) => {
    if (bookmark.pageNumber) {
      setMushafPage(bookmark.pageNumber);
      storageService.saveLastMushafPage(bookmark.pageNumber);
      setViewStyle('mushaf');
      if (bookmark.verseKey) {
        handleJumpToVerse(bookmark.verseKey);
      }
    }
  }, [handleJumpToVerse]);

  const handleStartHifz = useCallback(() => {
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
  }, [numSurahId, hifzStart, timestampMap, isCurrentSurah, handlePlaySurah, dispatch]);

  const handleStopHifz = useCallback(() => {
    setIsHifzActive(false);
    setHifzCurrentLoop(1);
  }, []);

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
      <HifzLooperPanel
        isOpen={isHifzOpen}
        isActive={isHifzActive}
        startVerse={hifzStart}
        endVerse={hifzEnd}
        maxVerses={chapterData?.chapter?.verses_count || 1}
        targetLoops={hifzTargetLoops}
        onStart={handleStartHifz}
        onStop={handleStopHifz}
        onStartChange={setHifzStart}
        onEndChange={setHifzEnd}
        onTargetLoopsChange={setHifzTargetLoops}
      />

      {/* Verses Tab Content */}
      {activeTab === 'verses' && (
        <div className="space-y-4">
          {/* MODE 1: AUTHENTIC MADINAH MUSHAF (EXACT 604-PAGE EDITION) */}
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

          {/* MODE 2: STRUCTURED AYAH CARDS */}
          {viewStyle === 'cards' && (
            <SuraCardsView
              verses={verses}
              showBismillah={showBismillah}
              isCurrentAndPlaying={isCurrentAndPlaying}
              activeVerseKey={activeVerseKey}
              fontSize={fontSize}
              showTranslation={showTranslation}
              onJumpToVerse={handleJumpToVerse}
            />
          )}

          {/* MODE 3: CONTINUOUS MUSHAF FLOW */}
          {viewStyle === 'continuous' && (
            <SuraContinuousView
              verses={verses}
              showBismillah={showBismillah}
              isCurrentAndPlaying={isCurrentAndPlaying}
              activeVerseKey={activeVerseKey}
              fontSize={fontSize}
              onJumpToVerse={handleJumpToVerse}
            />
          )}
        </div>
      )}

      {/* Info Tab Content */}
      {activeTab === 'info' && <SuraInfoTab infoData={infoData} />}
    </div>
  );
};

export default SuraDetails;
