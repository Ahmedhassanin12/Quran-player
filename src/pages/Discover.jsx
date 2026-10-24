import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiGrid, FiList, FiMic } from 'react-icons/fi';
import {
  Error,
  Loader,
  SurahCard,
  Searchbar,
  CuratedCollections,
  ContinueListeningBanner,
} from '../components';
import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from '../redux/services/quranCore';
import { CURATED_COLLECTIONS } from '../assets/collectionsData';
import { setActiveSura, playPause } from '../redux/features/playerSlice';

const Discover = () => {
  const dispatch = useDispatch();
  const {
    activeSura,
    isPlaying,
    currentReciter,
    favorites = [],
    recents = [],
  } = useSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'makkah' | 'madinah' | 'favorites' | 'history'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  const reciterId = currentReciter?.id || 7;
  const { data: surahData, isFetching: isFetchingSurahs, error: surahError } = useGetAllChaptersQuery();
  const { data: audioData, isFetching: isFetchingAudio, error: audioError } = useGetAllSurahAudioQuery(reciterId);

  // Map audio files by chapter_id for exact matching
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

  // Combined surah dataset with verified metadata and audio files
  const allSurahsWithAudio = useMemo(() => {
    if (!surahData?.chapters) return [];

    return surahData.chapters.map((chapter) => {
      const audio = audioMap[chapter.id];
      return {
        ...chapter,
        chapter_id: chapter.id,
        audio_url: audio?.audio_url || '',
        file_size: audio?.file_size,
        reciter_id: reciterId,
      };
    });
  }, [surahData, audioMap, reciterId]);

  // Filtered by tab, collection, and search
  const filteredSurahs = useMemo(() => {
    let list = allSurahsWithAudio;

    // 1. Tab filter
    if (activeTab === 'makkah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'makkah');
    } else if (activeTab === 'madinah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'madinah');
    } else if (activeTab === 'favorites') {
      list = list.filter((s) => favorites.includes(Number(s.id)));
    }

    // 2. Curated collection filter
    if (selectedCollectionId) {
      const col = CURATED_COLLECTIONS.find((c) => c.id === selectedCollectionId);
      if (col) {
        list = list.filter((s) => col.surahIds.includes(Number(s.id)));
      }
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          String(s.id) === q ||
          s.name_simple?.toLowerCase().includes(q) ||
          s.name_arabic?.includes(q) ||
          s.translated_name?.name?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allSurahsWithAudio, activeTab, selectedCollectionId, searchQuery, favorites]);

  const handlePlayRecent = (recent) => {
    const matchedSura = allSurahsWithAudio.find((s) => s.id === recent.surahId);
    if (!matchedSura) return;

    dispatch(
      setActiveSura({
        sura: matchedSura,
        i: matchedSura.id - 1,
        data: allSurahsWithAudio,
        audioData: audioData?.audio_files,
        reciter: currentReciter,
      }),
    );
    dispatch(playPause(true));
  };

  if (isFetchingSurahs || (isFetchingAudio && allSurahsWithAudio.length === 0)) {
    return <Loader title="Loading Holy Quran Surahs..." />;
  }

  if (surahError || audioError) {
    return <Error message="Unable to load Surah recitations. Please verify your connection." />;
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* Continue Listening Persistent Session */}
      <ContinueListeningBanner
        allSurahs={allSurahsWithAudio}
        audioFiles={audioData?.audio_files}
      />

      {/* Header Banner */}
      <div className="relative rounded-lg p-2 sm:p-3 bg-gradient-to-r from-midnight-850 via-midnight-900 to-midnight-850 border border-midnight-700/80 shadow-xl overflow-hidden ">
        <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Holy Quran Library</span>
              <span>•</span>
              <span>114 Surahs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Discover Recitations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-arabic mt-1">
              استمع إلى آيات الذكر الحكيم بأعذب الأصوات وأجمل التلاوات
            </p>
          </div>

          {/* Active Reciter Pill */}
          <Link
            to="/top-reciters"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-midnight-800/80 hover:bg-midnight-800 border border-indigo-500/30 text-left transition-all hover:border-indigo-500/60 group shadow-md"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FiMic size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-indigo-300">
                Active Reciter
              </span>
              <p className="text-xs font-semibold text-slate-100 truncate max-w-[160px]">
                {currentReciter?.reciter_name}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Sunnah & Thematic Collections Shelf */}
      <CuratedCollections
        onSelectCollection={setSelectedCollectionId}
        selectedCollectionId={selectedCollectionId}
        allSurahs={allSurahsWithAudio}
        audioFiles={audioData?.audio_files}
        currentReciter={currentReciter}
      />

      {/* Tier 1: Search Input */}
      <div className="w-full pt-1 ">
        <Searchbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, number, or Arabic title..."
        />
      </div>

      {/* Tier 2: Dedicated Filter Tabs & View Mode Row (100% Visible - Zero Clipping) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1  ">
        {/* All Tabs: All (114), Meccan, Medinan, Favorites, History */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-midnight-850 border border-midnight-700/80 text-xs shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSelectedCollectionId(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'all' && !selectedCollectionId
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800'
            }`}
          >
            All (114)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('makkah')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'makkah'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800'
            }`}
          >
            Meccan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('madinah')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'madinah'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800'
            }`}
          >
            Medinan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800'
            }`}
          >
            <span>⭐</span>
            <span>Favorites ({favorites.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800'
            }`}
          >
            <span>🕒</span>
            <span>History ({recents.length})</span>
          </button>
        </div>

        {/* Right Side: Result Count & View Mode Toggle */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="font-mono text-slate-400 hidden sm:inline">
            {filteredSurahs.length} {filteredSurahs.length === 1 ? 'Surah' : 'Surahs'}
          </span>

          <div className="flex p-1 rounded-lg bg-midnight-850 border border-midnight-700/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-midnight-800 text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List layout"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-midnight-800 text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* History Tab View */}
      {activeTab === 'history' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recently Played Recitations</h3>
            <span className="text-xs text-slate-400">Last {recents.length} played</span>
          </div>

          {recents.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-midnight-850 border border-midnight-700/60">
              <span className="text-3xl block mb-2">🕒</span>
              <p className="text-sm text-slate-300 font-semibold">No listening history yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your played recitations will automatically appear here as you listen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recents.map((item, idx) => (
                <div
                  key={`${item.surahId}-${item.reciterId}-${idx}`}
                  onClick={() => handlePlayRecent(item)}
                  className="p-4 rounded-lg bg-midnight-850 hover:bg-midnight-800 border border-midnight-700/70 hover:border-indigo-500/50 transition cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Surah {item.surahId}
                    </div>
                    <div className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {item.surahName} {item.arabicName && <span className="font-arabic font-normal text-slate-300">({item.arabicName})</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.reciterName}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-9 h-9 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500 text-indigo-300 group-hover:text-white flex items-center justify-center transition shadow"
                    aria-label={`Play Surah ${item.surahName}`}
                  >
                    <svg className="w-4 h-4 fill-current pl-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Regular Surahs Library Grid / List */
        <>
          {filteredSurahs.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-midnight-850 border border-midnight-700/60">
              {activeTab === 'favorites' ? (
                <>
                  <span className="text-3xl block mb-2">⭐</span>
                  <p className="text-base text-slate-300 font-semibold">
                    No favorite Surahs saved yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click the small heart icon on any Surah card to pin your favorite chapters here for quick access.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base text-slate-300 font-semibold">
                    No Surahs found matching &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching with an English transliteration (e.g., &ldquo;Baqarah&rdquo;) or Arabic name.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3'
                  : 'flex flex-col space-y-2'
              }
            >
              {filteredSurahs.map((sura, i) => (
                <SurahCard
                  key={sura.id}
                  sura={sura}
                  i={i}
                  data={filteredSurahs}
                  audioData={audioData?.audio_files}
                  isPlaying={isPlaying}
                  activeSura={activeSura}
                  currentReciter={currentReciter}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discover;
