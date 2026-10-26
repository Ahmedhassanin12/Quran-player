import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheck, FiDownload, FiLoader } from 'react-icons/fi';
import {
  downloadSurah,
  selectDownloadError,
  selectDownloadStatus,
  selectIsDownloaded,
} from '../redux/features/downloadsSlice';

const DownloadSurahButton = ({
  surahId,
  reciterId,
  reciterName = '',
  surahName = '',
  arabicName = '',
  audioUrl = '',
  size = 'md',
  className = '',
  labelMode = 'icon', // 'icon' | 'labeled'
}) => {
  const dispatch = useDispatch();
  const id = Number(surahId);
  const reader = Number(reciterId);

  const isDownloaded = useSelector(selectIsDownloaded(reader, id));
  const status = useSelector(selectDownloadStatus(reader, id));
  const error = useSelector(selectDownloadError(reader, id));

  const isDownloading = status === 'downloading';
  const canStart = Boolean(id && reader && audioUrl);
  const disabled = !canStart || isDownloading;

  const title = useMemo(() => {
    if (isDownloading) return 'Downloading…';
    if (isDownloaded) return 'Downloaded for offline listening';
    if (error) return `Download failed: ${error}`;
    if (!audioUrl) return 'Audio unavailable';
    return 'Download for offline listening';
  }, [isDownloading, isDownloaded, error, audioUrl]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isDownloaded || disabled) return;

    dispatch(
      downloadSurah({
        surahId: id,
        reciterId: reader,
        reciterName,
        surahName,
        arabicName,
        audioUrl,
      }),
    );
  };

  const sizeClasses =
    size === 'sm'
      ? 'p-1.5 text-[11px]'
      : 'px-3 py-1.5 text-xs';

  const iconSize = size === 'sm' ? 13 : 14;

  let Icon = FiDownload;
  if (isDownloading) Icon = FiLoader;
  else if (isDownloaded) Icon = FiCheck;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDownloaded ? true : disabled}
      aria-label={title}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold transition ${sizeClasses} ${
        isDownloaded
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 cursor-default'
          : isDownloading
            ? 'bg-midnight-750 text-indigo-300 border-indigo-500/40 cursor-wait'
            : error
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20'
              : 'bg-midnight-800/70 text-slate-300 hover:text-white border-midnight-700/60 hover:border-midnight-600'
      } ${className}`}
    >
      <Icon
        size={iconSize}
        className={isDownloading ? 'animate-spin' : undefined}
      />
      {labelMode === 'labeled' && (
        <span>
          {isDownloading ? 'Downloading…' : isDownloaded ? 'Downloaded' : 'Download'}
        </span>
      )}
    </button>
  );
};

export default DownloadSurahButton;
