import React, { useMemo } from 'react';
import { FiCheck, FiDownload, FiLoader } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  downloadSurah,
  selectDownloadError,
  selectDownloadStatus,
  selectIsDownloaded,
} from '../redux/features/downloadsSlice';

export interface DownloadSurahButtonProps {
  surahId: number | string;
  reciterId: number | string;
  reciterName?: string;
  surahName?: string;
  arabicName?: string;
  audioUrl?: string;
  size?: 'sm' | 'md';
  className?: string;
  labelMode?: 'icon' | 'labeled';
}

const DownloadSurahButton: React.FC<DownloadSurahButtonProps> = ({
  surahId,
  reciterId,
  reciterName = '',
  surahName = '',
  arabicName = '',
  audioUrl = '',
  size = 'md',
  className = '',
  labelMode = 'icon',
}) => {
  const dispatch = useAppDispatch();
  const id = Number(surahId);
  const reader = Number(reciterId);

  const isDownloaded = useAppSelector(selectIsDownloaded(reader, id));
  const status = useAppSelector(selectDownloadStatus(reader, id));
  const error = useAppSelector(selectDownloadError(reader, id));

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

  let stateClasses = 'bg-midnight-800/70 text-slate-300 hover:text-white border-midnight-700/60 hover:border-midnight-600';
  if (isDownloaded) {
    stateClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 cursor-default';
  } else if (isDownloading) {
    stateClasses = 'bg-midnight-750 text-indigo-300 border-indigo-500/40 cursor-wait';
  } else if (error) {
    stateClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:bg-rose-500/20';
  }

  let labelText = 'Download';
  if (isDownloading) labelText = 'Downloading…';
  else if (isDownloaded) labelText = 'Downloaded';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDownloaded ? true : disabled}
      aria-label={title}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold transition ${sizeClasses} ${stateClasses} ${className}`}
    >
      <Icon
        size={iconSize}
        className={isDownloading ? 'animate-spin' : undefined}
      />
      {labelMode === 'labeled' && (
        <span>{labelText}</span>
      )}
    </button>
  );
};

export default DownloadSurahButton;
