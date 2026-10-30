import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiList, FiVolume2, FiVolumeX } from 'react-icons/fi';
import {
  MdSkipNext,
  MdSkipPrevious,
  MdReplay10,
  MdForward10,
} from 'react-icons/md';
import {
  BsArrowRepeat,
  BsFillPauseFill,
  BsFillPlayFill,
  BsShuffle,
} from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setIsExpanded,
  playPause,
  cycleRepeatMode,
  toggleShuffle,
  setActiveSura,
  selectActiveSura,
  selectCurrentSura,
  selectIsPlaying,
  selectCurrentReciter,
  selectRepeatMode,
  selectShuffle,
  selectIsExpanded,
} from '../../redux/features/playerSlice';
import { SurahMedallion, ReciterAvatar } from '../IslamicArtwork';
import { formatPlaybackTime, formatNumber } from '../../utils/formatters';
import { getLocalizedReciterName, getLocalizedSurahName } from '../../utils/quranUtils';
import { normalizeLanguage } from '../../i18n';
import type { Surah } from '../../types';

export interface ExpandedPlayerProps {
  appTime?: number;
  duration?: number;
  onSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  volume?: number;
  onVolumeChange: (newVal: number) => void;
  handleNextSong: () => void;
  handlePrevSong: () => void;
  handleSeekRelative: (seconds: number) => void;
}

const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  appTime = 0,
  duration = 0,
  onSeek,
  volume = 0.8,
  onVolumeChange,
  handleNextSong,
  handlePrevSong,
  handleSeekRelative,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const activeSura = useAppSelector(selectActiveSura);
  const currentSura = useAppSelector(selectCurrentSura);
  const isPlaying = useAppSelector(selectIsPlaying);
  const currentReciter = useAppSelector(selectCurrentReciter);
  const repeatMode = useAppSelector(selectRepeatMode);
  const shuffle = useAppSelector(selectShuffle);
  const isExpanded = useAppSelector(selectIsExpanded);

  const [showQueue, setShowQueue] = useState<boolean>(false);

  useEffect(() => {
    if (!isExpanded) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        dispatch(playPause(!isPlaying));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekRelative(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekRelative(-10);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        dispatch(setIsExpanded(false));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, isPlaying, dispatch, handleSeekRelative]);

  if (!isExpanded || !activeSura) return null;

  const surahId = activeSura?.chapter_id || activeSura?.id || 1;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const safeAppTime = Number.isFinite(appTime) && appTime > 0
    ? Math.min(appTime, safeDuration || appTime)
    : 0;
  const progressPercentage = safeDuration > 0 ? (safeAppTime / safeDuration) * 100 : 0;
  const remainingTime = safeDuration > safeAppTime ? safeDuration - safeAppTime : 0;

  const handleNavigateToSurahDetails = () => {
    dispatch(setIsExpanded(false));
    navigate(`/surah/${surahId}`);
  };

  const localizedSurahName = getLocalizedSurahName(activeSura, currentLang);
  const localizedReciterName = getLocalizedReciterName(currentReciter, currentLang);
  const styleKey = (currentReciter?.style || 'Murattal') as 'Murattal' | 'Mujawwad' | 'Muallim';
  const localizedStyle = t(`reciters.styles.${styleKey}`, { defaultValue: currentReciter?.style || 'Murattal' });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-midnight-950/98 backdrop-blur-2xl text-slate-100 p-6 md:p-10 animate-slideup select-none overflow-y-auto">

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-midnight-700/80">
        <button
          type="button"
          onClick={() => dispatch(setIsExpanded(false))}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ms-2 rounded-lg hover:bg-midnight-800"
          aria-label={t('player.minimizePlayerAria')}
        >
          <FiChevronDown size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
            {t('player.minimizePlayerAria')}
          </span>
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
            {t('player.nowReciting')}
          </span>
          <p className="text-xs text-slate-400 font-arabic mt-0.5">
            {t('player.blessedRecitation')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
            showQueue
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-midnight-800'
          }`}
          aria-label={t('player.surahQueue', { count: formatNumber(currentSura?.length || 0, currentLang) as unknown as number })}
        >
          <FiList size={18} />
          <span className="hidden sm:inline">
            {t('player.surahQueue', { count: formatNumber(currentSura?.length || 0, currentLang) as unknown as number })}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center my-6 gap-8 max-w-5xl mx-auto w-full">
        {/* Artwork & Recitation Details */}
        <div className="flex-1 flex flex-col items-center text-center max-w-md w-full">
          <button
            type="button"
            onClick={handleNavigateToSurahDetails}
            className="group flex flex-col items-center focus:outline-none transition-transform hover:scale-[1.02] cursor-pointer"
            title={t('player.viewSurah')}
          >
            <SurahMedallion
              number={surahId}
              nameArabic={activeSura?.name_arabic}
              size="xl"
              isPlaying={isPlaying}
              className="shadow-2xl shadow-indigo-950/80 mb-6 group-hover:ring-2 group-hover:ring-indigo-400/50 rounded-full transition-all"
            />

            <h2 className="font-arabic text-4xl sm:text-5xl font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors" lang="ar" dir="rtl">
              سورة {activeSura?.name_arabic}
            </h2>

            <h3 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-1 group-hover:text-indigo-200 transition-colors flex items-center gap-1.5">
              <span>{localizedSurahName}</span>
              <span className="text-xs font-normal text-indigo-400/80 group-hover:underline">
                ({t('player.viewSurah')} ❯)
              </span>
            </h3>
          </button>

          <p className="text-sm text-slate-400 mb-4">
            {activeSura?.translated_name?.name || t('common.holyQuran')} •{' '}
            <span className="text-indigo-400 font-medium">
              {t('common.versesCount', { count: formatNumber(activeSura?.verses_count, currentLang) as unknown as number })}
            </span>
          </p>

          {/* Reciter Badge */}
          {currentReciter && (
            <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg bg-midnight-850/80 border border-midnight-700/80">
              <ReciterAvatar
                photoUrl={currentReciter.photo_url}
                name={currentReciter.reciter_name}
                arabicName={currentReciter.arabic_name}
                size="sm"
              />
              <div className="text-start">
                <p className="text-xs font-semibold text-slate-200">
                  {localizedReciterName}
                </p>
                <p className="text-[11px] text-indigo-400">
                  {localizedStyle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Queue Drawer */}
        {showQueue && (
          <div className="w-full lg:w-80 h-72 lg:h-96 rounded-lg bg-midnight-850 border border-midnight-700 p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-midnight-700">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                {t('player.surahQueue', { count: formatNumber(currentSura?.length || 0, currentLang) as unknown as number })}
              </h4>
              <span className="text-[11px] text-indigo-400 font-semibold font-mono">
                {formatNumber(114, currentLang)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pe-1">
              {currentSura?.map((item: Surah, idx: number) => {
                const itemId = item.chapter_id || item.id || idx + 1;
                const isItemCurrent = surahId === itemId || activeSura?.id === item.id;
                const queueSurahName = getLocalizedSurahName(item, currentLang);

                return (
                  <button
                    type="button"
                    key={item.id || idx}
                    onClick={() => {
                      dispatch(
                        setActiveSura({
                          sura: item,
                          i: idx,
                          data: currentSura,
                          reciter: currentReciter,
                        }),
                      );
                      dispatch(playPause(true));
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-start transition-all ${
                      isItemCurrent
                        ? 'bg-midnight-800 text-indigo-300 border border-indigo-500/50 shadow-sm'
                        : 'hover:bg-midnight-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xs font-mono text-slate-400 w-5" dir="ltr">
                        {itemId}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {queueSurahName}
                      </span>
                    </div>
                    {item.name_arabic && currentLang !== 'ar' && (
                      <span className="font-arabic text-xs font-bold text-indigo-300" lang="ar" dir="rtl">
                        {item.name_arabic}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Playback Controls Area */}
      <div className="relative z-10 max-w-3xl mx-auto w-full pt-4">
        {/* Seekbar (Always LTR for audio progress) */}
        <div dir="ltr" className="w-full flex items-center space-x-3 mb-4">
          <span className="text-xs text-slate-400 w-12 text-right tabular-nums">
            {formatPlaybackTime(safeAppTime)}
          </span>

          <div className="relative flex-1 flex items-center group py-2">
            <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 group-hover:bg-indigo-400 rounded-full"
                style={{ width: `${progressPercentage}%`, transition: 'width 80ms linear' }}
              />
            </div>
            <input
              type="range"
              step="any"
              value={safeDuration > 0 ? safeAppTime : 0}
              min={0}
              max={safeDuration > 0 ? safeDuration : 1}
              disabled={safeDuration <= 0}
              onChange={onSeek}
              aria-label={t('player.seekTimelineAria')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
            />
          </div>

          <span className="text-xs text-slate-400 w-14 text-left tabular-nums">
            -{formatPlaybackTime(remainingTime)}
          </span>
        </div>

        {/* Transport Controls (Always LTR for universal media standard) */}
        <div dir="ltr" className="flex items-center justify-between">
          {/* Shuffle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleShuffle())}
            aria-label={t('player.shuffleAria')}
            title={t('player.shuffleTitle')}
            className={`p-2.5 rounded-lg transition-colors ${
              shuffle
                ? 'text-indigo-400 bg-midnight-800 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BsShuffle size={20} />
          </button>

          {/* Central Controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button
              type="button"
              onClick={handlePrevSong}
              aria-label={t('player.previousSurahAria')}
              title={t('player.previousSurahTitle')}
              className="text-slate-300 hover:text-white transition-colors p-2"
            >
              <MdSkipPrevious size={32} />
            </button>

            <button
              type="button"
              onClick={() => handleSeekRelative(-10)}
              aria-label={t('player.rewind10Aria')}
              title={t('player.rewind10Title')}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
            >
              <MdReplay10 size={26} />
            </button>

            {/* Big Play/Pause Button */}
            <button
              type="button"
              onClick={() => dispatch(playPause(!isPlaying))}
              aria-label={isPlaying ? t('player.pauseAria') : t('player.playAria')}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-950/70 transition-transform transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? (
                <BsFillPauseFill size={36} />
              ) : (
                <BsFillPlayFill size={36} className="ps-1" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSeekRelative(10)}
              aria-label={t('player.forward10Aria')}
              title={t('player.forward10Title')}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2"
            >
              <MdForward10 size={26} />
            </button>

            <button
              type="button"
              onClick={handleNextSong}
              aria-label={t('player.nextSurahAria')}
              title={t('player.nextSurahTitle')}
              className="text-slate-300 hover:text-white transition-colors p-2"
            >
              <MdSkipNext size={32} />
            </button>
          </div>

          {/* Repeat Button */}
          <button
            type="button"
            onClick={() => dispatch(cycleRepeatMode())}
            aria-label={t('player.repeatAria')}
            title={t('player.repeatTitle')}
            className={`relative p-2.5 rounded-lg transition-colors ${
              repeatMode !== 'off'
                ? 'text-indigo-400 bg-midnight-800 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BsArrowRepeat size={22} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-indigo-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume Bar in expanded player footer */}
        <div dir="ltr" className="flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-midnight-700/80">
          <button
            type="button"
            onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
            className="text-slate-400 hover:text-white"
            aria-label={volume === 0 ? t('player.unmuteAria') : t('player.muteAria')}
          >
            {volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
          </button>
          <div className="w-36">
            <input
              type="range"
              step="0.01"
              value={volume}
              min="0"
              max="1"
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label={t('player.volumeAria')}
              className="w-full h-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedPlayer;
