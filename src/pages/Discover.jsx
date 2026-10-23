import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiGrid, FiList, FiMic } from 'react-icons/fi';
import {
  Error,
  Loader,
  SurahCard,
  Searchbar,
} from '../components';
import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from '../redux/services/quranCore';

const Discover = () => {
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'makkah' | 'madinah'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

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

  // Filtered by search and revelation place
  const filteredSurahs = useMemo(() => {
    let list = allSurahsWithAudio;

    if (activeTab === 'makkah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'makkah');
    } else if (activeTab === 'madinah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'madinah');
    }

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
  }, [allSurahsWithAudio, activeTab, searchQuery]);

  if (isFetchingSurahs || (isFetchingAudio && allSurahsWithAudio.length === 0)) {
    return <Loader title="Loading Holy Quran Surahs..." />;
  }

  if (surahError || audioError) {
    return <Error message="Unable to load Surah recitations. Please verify your connection." />;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-midnight-850 via-midnight-900 to-midnight-850 border border-midnight-700/80 shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-10 md:pr-0">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <span>Holy Quran Library</span>
              <span>•</span>
              <span>114 Surahs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Discover Recitations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-arabic mt-1">
              استمع إلى آيات الذكر الحكيم بأعذب الأصوات وأجمل التلاوات
            </p>
          </div>

          {/* Active Reciter Pill */}
          <Link
            to="/top-reciters"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-midnight-800/80 hover:bg-midnight-800 border border-indigo-500/30 text-left transition-all hover:border-indigo-500/60 group shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
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

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <Searchbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, number, or Arabic title..."
        />

        {/* Tab Filters & View Mode */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tabs */}
          <div className="flex p-1 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-500 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (114)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('makkah')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'makkah'
                  ? 'bg-indigo-500 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meccan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('madinah')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'madinah'
                  ? 'bg-indigo-500 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Medinan
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden lg:flex p-1 rounded-xl bg-midnight-850 border border-midnight-700/80">
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

      {/* Surahs Library Grid / List */}
      {filteredSurahs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-midnight-850 border border-midnight-700/60">
          <p className="text-base text-slate-300 font-semibold">
            No Surahs found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try searching with an English transliteration (e.g., &ldquo;Baqarah&rdquo;) or Arabic name.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-3'
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
    </div>
  );
};

export default Discover;
