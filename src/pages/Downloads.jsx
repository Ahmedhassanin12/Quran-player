import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiDownload, FiPlay, FiTrash2, FiWifiOff } from 'react-icons/fi';
import {
  removeDownload,
  selectDownloadItems,
  selectDownloadsHydrated,
  selectTotalDownloadBytes,
} from '../redux/features/downloadsSlice';
import {
  playPause,
  setActiveSura,
} from '../redux/features/playerSlice';
import { VERIFIED_RECITERS, DEFAULT_RECITER } from '../assets/recitersData';
import useOnlineStatus from '../hooks/useOnlineStatus';

const formatBytes = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_) {
    return iso;
  }
};

const Downloads = () => {
  const dispatch = useDispatch();
  const isOnline = useOnlineStatus();
  const items = useSelector(selectDownloadItems);
  const hydrated = useSelector(selectDownloadsHydrated);
  const totalBytes = useSelector(selectTotalDownloadBytes);
  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const sortedItems = useMemo(
    () => [...(items || [])].sort((a, b) => String(b.downloadedAt).localeCompare(String(a.downloadedAt))),
    [items],
  );

  const handlePlay = (item) => {
    const reciter = VERIFIED_RECITERS.find((r) => Number(r.id) === Number(item.reciterId))
      || {
        ...(currentReciter || DEFAULT_RECITER),
        id: item.reciterId,
        reciter_name: item.reciterName || currentReciter?.reciter_name,
      };

    const playIndex = sortedItems.findIndex((it) => it.key === item.key);
    const downloadPlaylist = sortedItems.map((it) => ({
      id: it.surahId,
      chapter_id: it.surahId,
      name_simple: it.surahName,
      name_arabic: it.arabicName,
      audio_url: it.sourceUrl || '',
      reciter_id: it.reciterId,
      reciter_name: it.reciterName,
    }));

    dispatch(
      setActiveSura({
        sura: downloadPlaylist[playIndex] || {
          id: item.surahId,
          chapter_id: item.surahId,
          name_simple: item.surahName,
          name_arabic: item.arabicName,
          audio_url: item.sourceUrl || '',
          reciter_id: item.reciterId,
          reciter_name: item.reciterName,
        },
        data: downloadPlaylist,
        i: playIndex >= 0 ? playIndex : 0,
        reciter,
      }),
    );
    dispatch(playPause(true));
  };

  const handleDelete = (item) => {
    dispatch(removeDownload({ reciterId: item.reciterId, surahId: item.surahId }));
  };

  if (!hydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
        Loading downloads…
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      {!isOnline && (
        <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100/90">
          <FiWifiOff className="shrink-0 mt-0.5" size={16} />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-amber-100">You&apos;re offline</p>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Pick a downloaded surah below to listen. You can also read cached surahs from details.
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Downloads
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Offline surah library · التلاوات المحفوظة
          </p>
        </div>
        {sortedItems.length > 0 && (
          <div className="text-xs text-slate-400 bg-midnight-850/70 border border-midnight-700/60 rounded-lg px-3 py-2">
            <span className="font-semibold text-slate-200">{sortedItems.length}</span>
            {' '}saved
            <span className="text-slate-600 mx-1.5">·</span>
            <span className="font-semibold text-indigo-300">{formatBytes(totalBytes)}</span>
          </div>
        )}
      </header>

      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-midnight-700/80 bg-midnight-850/40">
          <div className="w-12 h-12 rounded-full bg-midnight-800 border border-midnight-700 flex items-center justify-center text-indigo-300 mb-4">
            <FiDownload size={22} />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-1">No downloads yet</h2>
          <p className="text-sm text-slate-400 max-w-md mb-5">
            {isOnline
              ? 'Download a surah from Discover or Surah details to listen offline. Files stay on this device and are keyed by reciter.'
              : 'Connect to the internet, download some surahs, then return here to listen offline.'}
          </p>
          {isOnline && (
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/30 transition"
            >
              Browse Surahs
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col space-y-2">
          {sortedItems.map((item) => {
            const isCurrent = activeSura
              && Number(activeSura.chapter_id || activeSura.id) === Number(item.surahId)
              && Number(activeSura.reciter_id || currentReciter?.id) === Number(item.reciterId);
            const isCurrentAndPlaying = isCurrent && isPlaying;

            return (
              <li
                key={item.key}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-midnight-800/95 border-indigo-500/50 ring-1 ring-indigo-500/25'
                    : 'bg-midnight-850/50 border-midnight-700/50 hover:border-midnight-600/60'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePlay(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePlay(item);
                    }
                  }}
                  className="min-w-0 flex-1 text-left cursor-pointer"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      to={`/surah/${item.surahId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-sm text-slate-100 hover:text-indigo-300 truncate"
                    >
                      {item.surahName || `Surah ${item.surahId}`}
                    </Link>
                    {item.arabicName && (
                      <span className="font-arabic text-base text-slate-300 truncate">
                        {item.arabicName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.reciterName || `Reciter #${item.reciterId}`}
                    <span className="text-slate-600 mx-1.5">·</span>
                    {formatBytes(item.sizeBytes)}
                    <span className="text-slate-600 mx-1.5">·</span>
                    {formatDate(item.downloadedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlay(item)}
                    aria-label={isCurrentAndPlaying ? 'Playing' : 'Play offline'}
                    title={isCurrentAndPlaying ? 'Now playing' : 'Play offline'}
                    className={`p-2 rounded-lg border transition ${
                      isCurrentAndPlaying
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-midnight-800 text-slate-300 border-midnight-700 hover:text-white'
                    }`}
                  >
                    <FiPlay size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    aria-label="Remove download"
                    title="Remove from offline library"
                    className="p-2 rounded-lg border bg-midnight-800 text-slate-400 border-midnight-700 hover:text-rose-300 hover:border-rose-500/40 transition"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Downloads;
