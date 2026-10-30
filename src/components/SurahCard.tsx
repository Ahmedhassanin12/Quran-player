import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';
import PlayPause from './PlayPause';
import DownloadSurahButton from './DownloadSurahButton';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  playPause,
  setActiveSura,
  toggleFavoriteSurah,
  selectIsFavoriteSurah,
} from '../redux/features/playerSlice';
import { VERIFIED_RECITERS, DEFAULT_RECITER } from '../assets/recitersData';
import { getOfflineSurahMetadata } from '../assets/surahMetadata';
import { formatNumber } from '../utils/formatters';
import { getLocalizedReciterName, getLocalizedSurahName } from '../utils/quranUtils';
import { normalizeLanguage } from '../i18n';
import type { Surah, AudioFile } from '../types/quran';
import type { Reciter } from '../types/reciter';

export interface SurahCardProps {
  sura: Surah;
  isPlaying?: boolean;
  activeSura?: Surah | null;
  i: number;
  data?: Surah[];
  audioData?: AudioFile[] | { audio_files?: AudioFile[] };
  currentReciter?: Reciter | null;
  viewMode?: 'grid' | 'list';
  onRemoveDownload?: (sura: Surah) => void;
}

const SurahCard: React.FC<SurahCardProps> = ({
  sura,
  isPlaying = false,
  activeSura,
  i,
  data,
  audioData,
  currentReciter,
  viewMode = 'grid',
  onRemoveDownload,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const dispatch = useAppDispatch();
  const surahId = Number(sura?.chapter_id || sura?.id || i + 1);
  const offlineMeta = getOfflineSurahMetadata(surahId);
  const isFavorite = useAppSelector(selectIsFavoriteSurah(surahId));
  const reciterId = Number(sura?.reciter_id || currentReciter?.id || 0);
  const effectiveReciterName = sura?.reciter_name || currentReciter?.reciter_name || '';

  const surahReciter: Reciter = useMemo(() => {
    if (sura?.reciter) return sura.reciter;
    const verified = VERIFIED_RECITERS.find((r) => Number(r.id) === reciterId);
    if (verified) return verified;
    if (effectiveReciterName) {
      return {
        ...(currentReciter || DEFAULT_RECITER),
        id: reciterId,
        reciter_name: effectiveReciterName,
      };
    }
    return currentReciter || DEFAULT_RECITER;
  }, [sura?.reciter, reciterId, effectiveReciterName, currentReciter]);

  const audioUrl = useMemo(() => {
    if (sura?.audio_url) return sura.audio_url;
    const files = Array.isArray(audioData) ? audioData : audioData?.audio_files;
    const match = files?.find((f) => Number(f.chapter_id) === surahId);
    return match?.audio_url || '';
  }, [sura?.audio_url, audioData, surahId]);

  const isCurrent = Boolean(
    activeSura
    && sura
    && ((activeSura.chapter_id
      && Number(sura.chapter_id || sura.id) === Number(activeSura.chapter_id))
      || Number(activeSura.id) === Number(sura.id))
    && (!reciterId || !activeSura.reciter_id || Number(activeSura.reciter_id || currentReciter?.id) === reciterId),
  );

  const isCurrentAndPlaying = isPlaying && isCurrent;

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    dispatch(
      setActiveSura({
        sura,
        i,
        data,
        audioData,
        reciter: surahReciter,
      }),
    );
    dispatch(playPause(true));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavoriteSurah(surahId));
  };

  const revelationPlace = sura?.revelation_place || offlineMeta?.revelation_place || 'makkah';
  const isMeccan = String(revelationPlace).toLowerCase() === 'makkah';
  const versesCount = sura?.verses_count || offlineMeta?.verses_count || 0;
  const arabicTitle = sura?.name_arabic || offlineMeta?.name_arabic || '';
  const englishTitle = sura?.name_simple || offlineMeta?.name_simple || t('common.surahNameFallback', { id: surahId });
  const translatedMeaning = sura?.translated_name?.name || offlineMeta?.translated_name || sura?.name_complex || t('common.holyQuran');
  const localizedPrimaryName = getLocalizedSurahName(sura, currentLang) || englishTitle;
  const localizedReciterLabel = getLocalizedReciterName(surahReciter, currentLang);

  // ==========================================
  // VIEW MODE: LIST ROW (Sleek Horizontal Tile)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        onClick={handlePlayClick}
        className={`group flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${isCurrent
          ? 'bg-midnight-800/95 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30'
          : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
          }`}
      >
        {/* Start: Number + Play + Primary Metadata */}
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="font-mono text-xs font-semibold text-slate-400 w-7 shrink-0" dir="ltr">
            {String(surahId).padStart(3, '0')}
          </span>

          <div className="shrink-0">
            <PlayPause
              isPlaying={isPlaying}
              activeSura={activeSura}
              sura={sura}
              handlePause={handlePauseClick}
              handlePlay={handlePlayClick}
              size="sm"
            />
          </div>

          <div className="min-w-0">
            <Link
              to={`/surah/${surahId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              <h4 className="font-semibold text-sm text-slate-200 truncate">
                {localizedPrimaryName}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {sura?.reciter_name ? (
                <span className="text-indigo-300/90 font-medium">{localizedReciterLabel}</span>
              ) : (
                translatedMeaning
              )}
            </p>
          </div>
        </div>

        {/* Center: Revelation Metadata */}
        <div className="hidden sm:flex items-center text-xs text-slate-400 font-medium gap-1.5 shrink-0 px-4">
          <span>{isMeccan ? t('common.meccan') : t('common.medinan')}</span>
          <span className="text-slate-600">·</span>
          <span>{t('common.versesCount', { count: formatNumber(versesCount, currentLang) as unknown as number })}</span>
        </div>

        {/* End: Sacred Arabic Title + Download + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-indigo-300 transition-colors"
            lang="ar"
            dir="rtl"
          >
            <span className="font-arabic text-xl sm:text-2xl font-bold text-slate-100">
              سورة {arabicTitle}
            </span>
          </Link>

          <DownloadSurahButton
            size="sm"
            surahId={surahId}
            reciterId={reciterId}
            reciterName={effectiveReciterName}
            surahName={englishTitle}
            arabicName={arabicTitle}
            audioUrl={audioUrl}
          />

          {onRemoveDownload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveDownload(sura);
              }}
              aria-label={t('surahCard.removeDownloadAria', { name: localizedPrimaryName })}
              title={t('surahCard.removeDownloadTitle')}
              className="p-1.5 rounded-lg border border-midnight-700/60 bg-midnight-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition"
            >
              <FiTrash2 size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? t('surahCard.removeFavoriteAria') : t('surahCard.addFavoriteAria')}
            title={isFavorite ? t('surahCard.removeFavoriteTitle') : t('surahCard.addFavoriteTitle')}
            className={`p-1.5 rounded-lg transition-colors ${isFavorite
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE: GRID CARD (Editorial Manuscript)
  // ==========================================
  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex flex-col justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer border ${isCurrent
        ? 'bg-midnight-800/95 border-indigo-500/60 shadow-lg shadow-black/40 ring-1 ring-indigo-500/30'
        : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
        }`}
    >
      {/* Top Bar: Clean Discrete Number & Metadata + Download + Favorite Action */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-mono font-semibold text-slate-300" dir="ltr">
            {String(surahId).padStart(3, '0')}
          </span>
          <span className="text-slate-600">·</span>
          <span>{isMeccan ? t('common.meccan') : t('common.medinan')}</span>
          <span className="text-slate-600">·</span>

        </div>

        <div className="flex items-center gap-1">
          <DownloadSurahButton
            size="sm"
            className="opacity-70 group-hover:opacity-100"
            surahId={surahId}
            reciterId={reciterId}
            reciterName={effectiveReciterName}
            surahName={englishTitle}
            arabicName={arabicTitle}
            audioUrl={audioUrl}
            labelMode="labeled"
          />

          {onRemoveDownload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveDownload(sura);
              }}
              aria-label={t('surahCard.removeDownloadAria', { name: localizedPrimaryName })}
              title={t('surahCard.removeDownloadTitle')}
              className="p-1 rounded-lg border border-midnight-700/60 bg-midnight-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition opacity-80 group-hover:opacity-100"
            >
              <FiTrash2 size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? t('surahCard.removeFavoriteAria') : t('surahCard.addFavoriteAria')}
            title={isFavorite ? t('surahCard.removeFavoriteTitle') : t('surahCard.addFavoriteTitle')}
            className={`p-1 rounded-lg transition-colors ${isFavorite
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-slate-500 hover:text-slate-300 opacity-60 group-hover:opacity-100'
              }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill={isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Middle: Majestic Sacred Arabic Calligraphy Title */}
      <div className="relative z-10 my-3.5 text-center" lang="ar" dir="rtl">
        <Link
          to={`/surah/${surahId}`}
          onClick={(e) => e.stopPropagation()}
          className="group-hover:text-indigo-300 transition-colors inline-block w-full"
        >
          <h3 className="font-arabic text-2xl sm:text-3xl font-bold text-slate-100 tracking-wide leading-normal">
            {arabicTitle}
          </h3>
        </Link>
      </div>

      {/* Bottom Row: Surah Title & Subtitle + Play/Pause Action */}
      <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-midnight-700/30">
        <div className="flex-1 min-w-0 pe-2">
          <Link
            to={`/surah/${surahId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline block"
          >
            <h4 className="font-semibold text-xs sm:text-sm text-slate-200 leading-tight truncate">
              {englishTitle}
            </h4>
          </Link>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {sura?.reciter_name ? (
              <span className="text-indigo-300/90 font-medium">{localizedReciterLabel}</span>
            ) : (
              translatedMeaning
            )}
          </p>
        </div>

        <div className='flex flex-col justify-end items-end gap-[2px]'>
          <div className="flex gap-2 shrink-0">
            {isCurrentAndPlaying && (
              <div className="flex items-center justify-center m-auto gap-0.5 px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 w-[fit-content] mt-1">
                <span className="playing-bar" />
                <span className="playing-bar" />
                <span className="playing-bar" />
              </div>
            )}
            <PlayPause
              isPlaying={isPlaying}
              activeSura={activeSura}
              sura={sura}
              handlePause={handlePauseClick}
              handlePlay={handlePlayClick}
              size="sm"
            />
          </div>
          <span className='text-slate-400 text-[10px]'>{t('common.versesCount', { count: formatNumber(versesCount, currentLang) as unknown as number })}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SurahCard);
