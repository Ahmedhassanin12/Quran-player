import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import {
  setActiveSura,
  playPause,
  selectActiveSura,
  selectIsPlaying,
  selectCurrentReciter,
  selectFavorites,
  selectRecents,
} from '../redux/features/playerSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { formatNumber } from '../utils/formatters';
import { getLocalizedReciterName, getLocalizedSurahName } from '../utils/quranUtils';
import { normalizeLanguage } from '../i18n';
import type { Surah, AudioFile, RecentRecitation } from '../types';

type ActiveTab = 'all' | 'makkah' | 'madinah' | 'favorites' | 'history';

const Discover: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const dispatch = useAppDispatch();
  const activeSura = useAppSelector(selectActiveSura);
  const isPlaying = useAppSelector(selectIsPlaying);
  const currentReciter = useAppSelector(selectCurrentReciter);
  const favorites = useAppSelector(selectFavorites);
  const recents = useAppSelector(selectRecents);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => storageService.getViewMode());
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    storageService.saveViewMode(mode);
  }, []);

  const reciterId = currentReciter?.id || 7;
  const { data: surahData, isFetching: isFetchingSurahs, error: surahError } = useGetAllChaptersQuery();
  const { data: audioData, isFetching: isFetchingAudio, error: audioError } = useGetAllSurahAudioQuery(reciterId);

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

  const filteredSurahs = useMemo<Surah[]>(() => {
    let list = allSurahsWithAudio;

    if (activeTab === 'makkah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'makkah');
    } else if (activeTab === 'madinah') {
      list = list.filter((s) => s.revelation_place?.toLowerCase() === 'madinah');
    } else if (activeTab === 'favorites') {
      list = list.filter((s) => favorites.includes(Number(s.id)));
    }

    if (selectedCollectionId) {
      const col = CURATED_COLLECTIONS.find((c) => c.id === selectedCollectionId);
      if (col) {
        list = list.filter((s) => col.surahIds.includes(Number(s.id)));
      }
    }

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

  const handlePlayRecent = useCallback((recent: RecentRecitation) => {
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
  }, [allSurahsWithAudio, audioData?.audio_files, currentReciter, dispatch]);

  if (isFetchingSurahs || (isFetchingAudio && allSurahsWithAudio.length === 0)) {
    return <Loader title={t('common.loading')} />;
  }

  if (surahError || audioError) {
    return <Error message={t('error.connectionInterrupted')} />;
  }

  const currentReciterDisplayName = getLocalizedReciterName(currentReciter, currentLang);

  return (
    <div className="flex flex-col space-y-3.5">
      {/* Editorial Sanctuary Masthead */}
      <div className="pt-1 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-midnight-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span className="font-arabic text-sm text-amber-400/90 font-normal" lang="ar" dir="rtl">
              {t('common.bismillah')}
            </span>
            <span className="text-slate-600">·</span>
            <span>{t('discover.blessedMushaf')}</span>
            <span className="text-slate-600">·</span>
            <span>{t('discover.complete114')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-baseline gap-3">
            <span>{t('discover.heroTitle')}</span>
          </h1>
        </div>

        {/* Current Reciter Switcher */}
        <Link
          to="/top-reciters"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-midnight-850/80 hover:bg-midnight-800 border border-midnight-700/70 hover:border-midnight-600 text-start transition-all group shadow-sm shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-midnight-750 border border-midnight-700 flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors shrink-0">
            <FiMic size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>{t('nav.currentReciter')}</span>
              <span className="text-slate-600">·</span>
              <span className="text-indigo-400 font-normal">{t('nav.change')} ▾</span>
            </div>
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[190px] group-hover:text-white">
              {currentReciterDisplayName}
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
            placeholder={t('discover.searchPlaceholder')}
          />
        </div>

        {/* Filter Segmented Controls + Result Count & View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 flex-1 min-w-0 lg:justify-end">
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
              {t('discover.tabs.all')} ({formatNumber(114, currentLang)})
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
              {t('discover.tabs.meccan')}
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
              {t('discover.tabs.medinan')}
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
              <span>{t('discover.tabs.favorites')} ({formatNumber(favorites.length, currentLang)})</span>
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
              <span>{t('discover.tabs.history')} ({formatNumber(recents.length, currentLang)})</span>
            </button>
          </div>

          {/* Result Count & View Mode Toggle */}
          <div className="flex items-center gap-2.5 text-xs text-slate-400 shrink-0">
            <span className="font-mono text-slate-400 text-xs hidden sm:inline">
              {t('common.surahsCount', { count: formatNumber(filteredSurahs.length, currentLang) as unknown as number })}
            </span>

            <ViewModeToggle viewMode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>
      </div>

      {/* History Tab View */}
      {activeTab === 'history' ? (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">{t('discover.recentlyPlayed')}</h3>
            <span className="text-xs text-slate-400">
              {t('discover.lastPlayedCount', { count: formatNumber(recents.length, currentLang) as unknown as number })}
            </span>
          </div>

          {recents.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-midnight-850/40 border border-midnight-700/50">
              <div className="w-12 h-12 rounded-xl bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-slate-400 mb-3 mx-auto">
                <FiClock size={22} />
              </div>
              <p className="text-sm text-slate-300 font-semibold">{t('discover.empty.noHistoryTitle')}</p>
              <p className="text-xs text-slate-400 mt-1">
                {t('discover.empty.noHistoryDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {recents.map((item, idx) => {
                const localizedSurah = getLocalizedSurahName(
                  { id: item.surahId, surahName: item.surahName, name_arabic: item.arabicName },
                  currentLang,
                );
                const localizedReciter = getLocalizedReciterName(
                  { id: item.reciterId, reciterName: item.reciterName },
                  currentLang,
                );

                return (
                  <div
                    key={`${item.surahId}-${item.reciterId}-${idx}`}
                    onClick={() => handlePlayRecent(item)}
                    className="p-4 rounded-xl bg-midnight-850/50 hover:bg-midnight-800/70 border border-midnight-700/50 hover:border-midnight-600 transition cursor-pointer flex items-center justify-between group shadow-sm"
                  >
                    <div className="min-w-0 pe-2">
                      <div className="text-[11px] font-mono text-slate-400" dir="ltr">
                        #{String(item.surahId).padStart(3, '0')}
                      </div>
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                        {localizedSurah}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {localizedReciter}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-midnight-750 group-hover:bg-midnight-700 border border-midnight-600 text-slate-200 flex items-center justify-center transition shrink-0"
                      aria-label={localizedSurah}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
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
                    {t('discover.empty.noFavoritesTitle')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {t('discover.empty.noFavoritesDesc')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base text-slate-300 font-semibold">
                    {t('discover.empty.noMatchTitle')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('discover.empty.noMatchDesc')}
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
