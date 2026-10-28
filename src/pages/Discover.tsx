import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiMic, FiBookmark, FiClock } from 'react-icons/fi';
import {
  Error,
  Loader,
  SurahCard,
  Searchbar,
  CuratedCollections,
  ContinueListeningBanner,
  ViewModeToggle,
} from '../components';
import { storageService } from '../services/storageService';
import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from '../redux/services/quranCore';
import { CURATED_COLLECTIONS } from '../assets/collectionsData';
import { setActiveSura, playPause } from '../redux/features/playerSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type { Surah, AudioFile, RecentRecitation } from '../types';

type ActiveTab = 'all' | 'makkah' | 'madinah' | 'favorites' | 'history';

const Discover: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    activeSura,
    isPlaying,
    currentReciter,
    favorites = [],
    recents = [],
  } = useAppSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => storageService.getViewMode());
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    storageService.saveViewMode(mode);
  };

  const reciterId = currentReciter?.id || 7;
  const { data: surahData, isFetching: isFetchingSurahs, error: surahError } = useGetAllChaptersQuery();
  const { data: audioData, isFetching: isFetchingAudio, error: audioError } = useGetAllSurahAudioQuery(reciterId);

  // Map audio files by chapter_id for exact matching
  const audioMap = useMemo<Record<number, AudioFile>>(() => {
    const map: Record<number, AudioFile> = {};
    if (audioData?.audio_files && Array.isArray(audioData.audio_files)) {
      audioData.audio_files.forEach((file: AudioFile) => {
        if (file?.chapter_id) {
          map[file.chapter_id] = file;
        }
      });
    }
    return map;
  }, [audioData]);

  // Combined surah dataset with verified metadata and audio files
  const allSurahsWithAudio = useMemo<Surah[]>(() => {
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
  const filteredSurahs = useMemo<Surah[]>(() => {
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
        (s) => String(s.id) === q
          || s.name_simple?.toLowerCase().includes(q)
          || s.name_arabic?.includes(q)
          || s.translated_name?.name?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allSurahsWithAudio, activeTab, selectedCollectionId, searchQuery, favorites]);

  const handlePlayRecent = (recent: RecentRecitation) => {
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
    <div className="flex flex-col space-y-3.5">
      {/* Editorial Sanctuary Masthead */}
      <div className="pt-1 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-midnight-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span className="font-arabic text-sm text-amber-400/90 font-normal">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </span>
            <span className="text-slate-600">·</span>
            <span>المصحف الشريف</span>
            <span className="text-slate-600">·</span>
            <span>١١٤ سورة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-baseline gap-3">
            <span>Discover Surahs</span>
            <span className="font-arabic font-normal text-xl sm:text-2xl text-slate-400">
              تلاوات القرآن الكريم
            </span>
          </h1>
        </div>

        {/* Current Reciter Switcher */}
        <Link
          to="/top-reciters"
          className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-midnight-850/80 hover:bg-midnight-800 border border-midnight-700/70 hover:border-midnight-600 text-left transition-all group shadow-sm shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-midnight-750 border border-midnight-700 flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors shrink-0">
            <FiMic size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>Reciter</span>
              <span className="text-slate-600">·</span>
              <span className="text-indigo-400 font-normal">Change ▾</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[170px] group-hover:text-white">
              {currentReciter?.reciter_name || 'Sheikh'}
            </p>
          </div>
        </Link>
      </div>

      {/* Continue Listening Persistent Session */}
      <ContinueListeningBanner
        allSurahs={allSurahsWithAudio}
        audioFiles={audioData?.audio_files}
      />

      {/* Sunnah & Thematic Collections Ribbon */}
      <CuratedCollections
        onSelectCollection={setSelectedCollectionId}
        selectedCollectionId={selectedCollectionId}
        allSurahs={allSurahsWithAudio}
        audioFiles={audioData?.audio_files}
        currentReciter={currentReciter}
      />

      {/* Unified Search & Filter Control Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Search Input */}
        <div className="w-full lg:w-80 shrink-0">
          <Searchbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, number, or Arabic title..."
          />
        </div>

        {/* Filter Segmented Controls + Result Count & View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 flex-1 min-w-0 lg:justify-end">
          {/* Tabs: All (114), Meccan, Medinan, Favorites, History */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-midnight-850/80 border border-midnight-700/60 text-xs shadow-sm overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSelectedCollectionId(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                activeTab === 'all' && !selectedCollectionId
                  ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (114)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('makkah')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                activeTab === 'makkah'
                  ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مكية
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('madinah')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                activeTab === 'madinah'
                  ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              مدنية
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'favorites'
                  ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiBookmark className="w-3.5 h-3.5" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiClock className="w-3.5 h-3.5" />
              <span>History ({recents.length})</span>
            </button>
          </div>

          {/* Result Count & View Mode Toggle */}
          <div className="flex items-center space-x-2.5 text-xs text-slate-400 shrink-0">
            <span className="font-mono text-slate-400 text-xs hidden sm:inline">
              {filteredSurahs.length} {filteredSurahs.length === 1 ? 'Surah' : 'Surahs'}
            </span>

            <ViewModeToggle viewMode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>
      </div>

      {/* History Tab View */}
      {activeTab === 'history' ? (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recently Played Recitations</h3>
            <span className="text-xs text-slate-400">Last {recents.length} played</span>
          </div>

          {recents.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-midnight-850/40 border border-midnight-700/50">
              <div className="w-12 h-12 rounded-xl bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-slate-400 mb-3 mx-auto">
                <FiClock size={22} />
              </div>
              <p className="text-sm text-slate-300 font-semibold">No listening history yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your played recitations will automatically appear here as you listen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {recents.map((item, idx) => (
                <div
                  key={`${item.surahId}-${item.reciterId}-${idx}`}
                  onClick={() => handlePlayRecent(item)}
                  className="p-4 rounded-xl bg-midnight-850/50 hover:bg-midnight-800/70 border border-midnight-700/50 hover:border-midnight-600 transition cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-mono text-slate-400">
                      Surah {String(item.surahId).padStart(3, '0')}
                    </div>
                    <div className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                      {item.surahName} {item.arabicName && <span className="font-arabic font-normal text-slate-300">({item.arabicName})</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {item.reciterName}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-midnight-750 group-hover:bg-midnight-700 border border-midnight-600 text-slate-200 flex items-center justify-center transition shrink-0"
                    aria-label={`Play Surah ${item.surahName}`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current pl-0.5" viewBox="0 0 24 24">
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
        <div className="pt-1">
          {filteredSurahs.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-midnight-850/40 border border-midnight-700/50">
              {activeTab === 'favorites' ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-slate-400 mb-3 mx-auto">
                    <FiBookmark size={22} />
                  </div>
                  <p className="text-base text-slate-300 font-semibold">
                    No favorite Surahs saved yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click the bookmark icon on any Surah card to pin your favorite chapters here for quick access.
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
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5'
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
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
