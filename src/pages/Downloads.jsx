import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiDownload,
  FiTrash2,
  FiWifiOff,
  FiSearch,
} from 'react-icons/fi';
import {
  SurahCard,
  Searchbar,
  ViewModeToggle,
  DownloadsConfirmModal,
} from '../components';
import {
  removeDownload,
  clearAllDownloads,
  selectDownloadItems,
  selectDownloadsHydrated,
  selectTotalDownloadBytes,
} from '../redux/features/downloadsSlice';
import { useGetAllChaptersQuery } from '../redux/services/quranCore';
import { VERIFIED_RECITERS, DEFAULT_RECITER } from '../assets/recitersData';
import { storageService } from '../services/storageService';
import useOnlineStatus from '../hooks/useOnlineStatus';

const formatBytes = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Downloads = () => {
  const dispatch = useDispatch();
  const isOnline = useOnlineStatus();
  const items = useSelector(selectDownloadItems);
  const hydrated = useSelector(selectDownloadsHydrated);
  const totalBytes = useSelector(selectTotalDownloadBytes);
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeReciterFilter, setActiveReciterFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => storageService.getViewMode());

  // Confirmation modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  // Optional chapter metadata from RTK Query cache (gracefully works offline if unpopulated)
  const { data: chaptersData } = useGetAllChaptersQuery(undefined, { skip: false });

  const chapterMap = useMemo(() => {
    const map = {};
    if (chaptersData?.chapters && Array.isArray(chaptersData.chapters)) {
      chaptersData.chapters.forEach((ch) => {
        map[ch.id] = ch;
      });
    }
    return map;
  }, [chaptersData]);

  const sortedItems = useMemo(
    () => [...(items || [])].sort((a, b) => String(b.downloadedAt).localeCompare(String(a.downloadedAt))),
    [items],
  );

  // Transform downloads into full sura models compatible with SurahCard
  const surahsForDisplay = useMemo(
    () => sortedItems.map((item) => {
      const ch = chapterMap[item.surahId] || {};
      const verifiedReciter = VERIFIED_RECITERS.find(
        (r) => Number(r.id) === Number(item.reciterId),
      );
      const reciter = verifiedReciter || {
        ...(currentReciter || DEFAULT_RECITER),
        id: item.reciterId,
        reciter_name: item.reciterName || currentReciter?.reciter_name,
      };

      return {
        ...ch,
        id: item.surahId,
        chapter_id: item.surahId,
        name_simple: item.surahName || ch.name_simple || `Surah ${item.surahId}`,
        name_arabic: item.arabicName || ch.name_arabic || '',
        audio_url: item.sourceUrl || '',
        reciter_id: item.reciterId,
        reciter_name: item.reciterName || reciter.reciter_name || '',
        size_bytes: item.sizeBytes,
        downloaded_at: item.downloadedAt,
        downloadKey: item.key,
        revelation_place: ch.revelation_place || 'makkah',
        verses_count: ch.verses_count || 0,
        translated_name: ch.translated_name || {
          name: item.reciterName || 'Offline Recitation',
        },
        reciter,
      };
    }),
    [sortedItems, chapterMap, currentReciter],
  );

  // Discovered reciters for filter tabs
  const availableReciters = useMemo(() => {
    const map = new Map();
    (sortedItems || []).forEach((item) => {
      if (item.reciterId && !map.has(item.reciterId)) {
        map.set(item.reciterId, item.reciterName || `Reciter #${item.reciterId}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sortedItems]);

  // Filtered dataset
  const filteredSurahs = useMemo(() => {
    let list = surahsForDisplay;

    if (activeReciterFilter !== 'all') {
      list = list.filter((s) => Number(s.reciter_id) === Number(activeReciterFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => String(s.id) === q
          || s.name_simple?.toLowerCase().includes(q)
          || s.name_arabic?.includes(q)
          || s.reciter_name?.toLowerCase().includes(q)
          || s.translated_name?.name?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [surahsForDisplay, activeReciterFilter, searchQuery]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    storageService.saveViewMode(mode);
  };

  const handlePromptDeleteSingle = (sura) => {
    setDeleteTarget(sura);
  };

  const handleConfirmDeleteSingle = () => {
    if (deleteTarget) {
      dispatch(
        removeDownload({
          reciterId: deleteTarget.reciter_id,
          surahId: deleteTarget.id,
        }),
      );
      setDeleteTarget(null);
    }
  };

  const handleConfirmClearAll = () => {
    dispatch(clearAllDownloads());
    setIsClearAllOpen(false);
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-sm">
        Loading offline library…
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3.5">
      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100/90 text-xs shadow-sm">
          <FiWifiOff className="shrink-0 mt-0.5 text-amber-300" size={15} />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-100">Offline Mode Active</span>
            <span className="text-amber-200/80 mx-1.5">·</span>
            <span>
              Listening to downloaded recitations and reading cached Mushaf pages.
            </span>
          </div>
        </div>
      )}

      {/* Editorial Sanctuary Masthead */}
      <div className="pt-1 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-midnight-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span className="font-arabic text-sm text-emerald-400/90 font-normal">
              تلاوات بدون إنترنت
            </span>
            <span className="text-slate-600">·</span>
            <span>المكتبة المحفوظة</span>
            <span className="text-slate-600">·</span>
            <span>
              {sortedItems.length} {sortedItems.length === 1 ? 'سورة' : 'سور'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-baseline gap-3">
            <span>Offline Downloads</span>
            <span className="font-arabic font-normal text-xl sm:text-2xl text-slate-400">
              التلاوات المحفوظة
            </span>
          </h1>
        </div>

        {/* Right Header Actions: Storage Badge + Clear All Downloads Button */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {sortedItems.length > 0 && (
            <div className="text-xs text-slate-400 bg-midnight-850/80 border border-midnight-700/60 rounded-xl px-3 py-2 shadow-sm flex items-center gap-1.5">
              <span className="font-semibold text-slate-200">{sortedItems.length}</span>
              <span>saved</span>
              <span className="text-slate-600 mx-1">·</span>
              <span className="font-semibold text-indigo-300 font-mono">
                {formatBytes(totalBytes)}
              </span>
            </div>
          )}

          {sortedItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearAllOpen(true)}
              aria-label="Clear all downloaded recitations"
              title="Remove all downloaded audio to free up device space"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-sm"
            >
              <FiTrash2 size={13} />
              <span>Clear All</span>
            </button>
          )}

          {isOnline && (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-midnight-850/80 hover:bg-midnight-800 text-slate-300 hover:text-white border border-midnight-700/70 hover:border-midnight-600 transition-all shadow-sm"
            >
              <span>+ Browse Surahs</span>
            </Link>
          )}
        </div>
      </div>

      {sortedItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border border-dashed border-midnight-700/80 bg-midnight-850/40 my-4">
          <div className="w-14 h-14 rounded-2xl bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-indigo-300 mb-4 shadow-inner">
            <FiDownload size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-100 mb-1">
            No offline recitations yet
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {isOnline
              ? 'Download your favorite Surahs from the Discover library to listen anytime without an internet connection. Audio files are saved directly to this device.'
              : 'You are currently offline and have no downloaded recitations saved. Reconnect to download Surahs for offline playback.'}
          </p>
          {isOnline && (
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/30 transition shadow-sm"
            >
              Browse Surah Library
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Unified Search & View Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            {/* Search Input */}
            <div className="w-full lg:w-80 shrink-0">
              <Searchbar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search downloaded surahs or reciters..."
              />
            </div>

            {/* Reciter Filter Tabs + Result Count & View Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 flex-1 min-w-0 lg:justify-end">
              {availableReciters.length > 1 && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-midnight-850/80 border border-midnight-700/60 text-xs shadow-sm overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setActiveReciterFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                      activeReciterFilter === 'all'
                        ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({sortedItems.length})
                  </button>
                  {availableReciters.map((r) => {
                    const count = sortedItems.filter(
                      (item) => Number(item.reciterId) === Number(r.id),
                    ).length;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setActiveReciterFilter(String(r.id))}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                          String(activeReciterFilter) === String(r.id)
                            ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Result Count & View Mode Toggle */}
              <div className="flex items-center space-x-2.5 text-xs text-slate-400 shrink-0 ml-auto">
                <span className="font-mono text-slate-400 text-xs hidden sm:inline">
                  {filteredSurahs.length}{' '}
                  {filteredSurahs.length === 1 ? 'Surah' : 'Surahs'}
                </span>

                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={handleViewModeChange}
                />
              </div>
            </div>
          </div>

          {/* Regular Surahs Grid / List using identical Discover layout & SurahCard */}
          <div className="pt-1">
            {filteredSurahs.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-midnight-850/40 border border-midnight-700/50">
                <div className="w-10 h-10 rounded-xl bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-slate-400 mb-3 mx-auto">
                  <FiSearch size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  No downloaded Surahs match &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try searching by Surah name, number, or reciter.
                </p>
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
                    key={sura.downloadKey || `${sura.reciter_id}:${sura.id}`}
                    sura={sura}
                    i={i}
                    data={filteredSurahs}
                    isPlaying={isPlaying}
                    activeSura={activeSura}
                    currentReciter={currentReciter}
                    viewMode={viewMode}
                    onRemoveDownload={handlePromptDeleteSingle}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modals */}
      <DownloadsConfirmModal
        isOpen={Boolean(deleteTarget)}
        mode="single"
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteSingle}
      />

      <DownloadsConfirmModal
        isOpen={isClearAllOpen}
        mode="all"
        totalCount={sortedItems.length}
        formattedSize={formatBytes(totalBytes)}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleConfirmClearAll}
      />
    </div>
  );
};

export default Downloads;
