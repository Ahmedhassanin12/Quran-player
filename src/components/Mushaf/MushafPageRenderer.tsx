import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiBookOpen } from 'react-icons/fi';
import { RubElHizbIcon } from '../IslamicArtwork';
import {
  getMushafPageInfo,
  getMushafPageImageUrl,
  TOTAL_MUSHAF_PAGES,
} from '../../assets/mushafMetadata';
import { useGetVersesByPageQuery } from '../../redux/services/quranCore';
import { formatNumber } from '../../utils/formatters';
import { normalizeLanguage } from '../../i18n';
import MushafAyahModal from './MushafAyahModal';
import type {
  MushafEngine,
  PlateTheme,
  MushafBookmark,
} from '../../types/mushaf';
import type { Verse, Word } from '../../types/quran';

export interface MushafPageRendererProps {
  pageNumber?: number;
  activeVerseKey?: string | null;
  onAyahClick?: (verseKey: string) => void;
  viewEngine?: MushafEngine;
  isCurrentAndPlaying?: boolean;
  bookmarks?: MushafBookmark[];
  onToggleBookmark?: (bookmarkData: Partial<MushafBookmark> & { verseKey: string; verseNumber?: number; surahId?: number }) => void;
}

interface LineWord extends Word {
  verse_key: string;
  verse_number: number;
  char_type_name?: string;
}

const MushafPageRenderer: React.FC<MushafPageRendererProps> = ({
  pageNumber = 1,
  activeVerseKey = null,
  onAyahClick,
  viewEngine = 'plate',
  isCurrentAndPlaying = false,
  bookmarks = [],
  onToggleBookmark,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [plateTheme, setPlateTheme] = useState<PlateTheme>('dark');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageInfo = useMemo(() => getMushafPageInfo(pageNumber), [pageNumber]);
  const imageUrl = useMemo(() => getMushafPageImageUrl(pageNumber), [pageNumber]);

  const {
    data: pageData,
  } = useGetVersesByPageQuery(
    { pageNumber, mushaf: 2 },
    { skip: viewEngine !== 'digital' && imageLoaded && !imageError },
  );

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber < TOTAL_MUSHAF_PAGES) {
      const nextImg = new Image();
      nextImg.src = getMushafPageImageUrl(pageNumber + 1);
    }
    if (pageNumber > 1) {
      const prevImg = new Image();
      prevImg.src = getMushafPageImageUrl(pageNumber - 1);
    }
  }, [pageNumber]);

  const verses = useMemo(() => pageData?.verses || [], [pageData]);

  const lineMap = useMemo(() => {
    const map: Record<number, LineWord[]> = {};
    for (let l = 1; l <= 15; l += 1) {
      map[l] = [];
    }

    verses.forEach((verse) => {
      (verse.words || []).forEach((word) => {
        const line = word.line_number;
        if (line && map[line]) {
          map[line].push({
            ...word,
            verse_key: verse.verse_key,
            verse_number: verse.verse_number,
          });
        }
      });
    });

    return map;
  }, [verses]);

  const surahStartVerses = useMemo(
    () => verses.filter((v) => v.verse_number === 1),
    [verses],
  );

  const handleWordClick = (word: LineWord) => {
    if (!word?.verse_key) return;
    const fullVerse = verses.find((v) => v.verse_key === word.verse_key);
    if (fullVerse) {
      setSelectedVerse(fullVerse);
      setIsModalOpen(true);
    }
    if (onAyahClick) {
      onAyahClick(word.verse_key);
    }
  };

  const isVerseBookmarked = (verseKey: string): boolean => (
    bookmarks.some((b) => b.verseKey === verseKey)
  );

  return (
    <div className="w-full flex flex-col items-center select-none animate-slowfade">
      {/* Outer Luxury Mushaf Folio Container */}
      <div className="w-full max-w-lg md:max-w-xl bg-midnight-950 rounded-xl sm:rounded-2xl border border-midnight-700/80 shadow-2xl overflow-hidden p-2 sm:p-5">
        {/* Authentic Page Top Header */}
        <div className="w-full flex items-center justify-between px-3 sm:px-6 py-2 border-b border-midnight-800 text-[11px] sm:text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2 text-indigo-300">
            <span>{t('mushaf.juz', { number: formatNumber(pageInfo?.juz || 1, currentLang) as unknown as number })}</span>
            {viewEngine === 'plate' && (
              <button
                type="button"
                onClick={() => setPlateTheme((prev) => (prev === 'dark' ? 'parchment' : 'dark'))}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-midnight-800 hover:bg-midnight-750 text-slate-300 text-[10px] font-sans border border-midnight-700/80 transition"
                title={t('mushaf.toggleThemeTitle')}
              >
                {plateTheme === 'dark' ? (
                  <>
                    <FiMoon size={11} className="text-indigo-400" />
                    <span>{t('mushaf.whiteScriptTheme')}</span>
                  </>
                ) : (
                  <>
                    <FiBookOpen size={11} className="text-amber-400" />
                    <span>{t('mushaf.parchmentTheme')}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-200 font-arabic" lang="ar" dir="rtl">
            <span>سورة {pageInfo?.surahNameArabic}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ENGINE 1: HIGH-RES 1260px AUTHENTIC CALLIGRAPHIC PLATE SCAN */}
        {/* ============================================================ */}
        {viewEngine === 'plate' ? (
          <div
            className={`relative w-full aspect-[1260/2038] flex items-center justify-center overflow-hidden my-2 sm:my-3 rounded-lg border border-midnight-700/60 transition-colors duration-300 ${
              plateTheme === 'parchment' ? 'bg-[#FAF7EE]' : 'bg-[#0D0F12]'
            }`}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-midnight-900/60 animate-pulse">
                <RubElHizbIcon className="w-12 h-12 text-indigo-500/40 animate-spin" />
                <p className="text-xs text-slate-400">
                  {t('mushaf.loadingPage', { page: formatNumber(pageNumber, currentLang) as unknown as number })}
                </p>
              </div>
            )}

            <img
              src={imageUrl}
              alt={t('mushaf.page', { current: pageNumber })}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={
                plateTheme === 'dark'
                  ? { filter: 'invert(1) brightness(1.2) contrast(1.1)' }
                  : { filter: 'contrast(1.05)' }
              }
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-midnight-950">
                <p className="text-xs text-amber-300">
                  {t('mushaf.imageErrorFallback')}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* ENGINE 2: 15-LINE STRUCTURED DIGITAL TYPOGRAPHY MUSHAF       */
          /* ============================================================ */
          <div
            lang="ar"
            dir="rtl"
            className="relative w-full aspect-[1260/2038] bg-[#0D0F12] flex flex-col justify-between p-3 sm:p-6 my-2 sm:my-3 rounded-lg border border-midnight-700/60 overflow-hidden"
          >
            <div className="relative z-10 w-full h-full flex flex-col justify-between select-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((lineNum) => {
                const wordsOnLine = lineMap[lineNum] || [];

                const isSurahHeaderLine = surahStartVerses.length > 0
                  && ((lineNum === 1 && pageNumber === 2)
                    || (lineNum === 1 && pageNumber === 50)
                    || (pageNumber === 604 && (lineNum === 1 || lineNum === 5 || lineNum === 10)));

                const isBismillahLine = surahStartVerses.length > 0
                  && ((lineNum === 2 && pageNumber === 2)
                    || (lineNum === 2 && pageNumber === 50)
                    || (pageNumber === 604 && (lineNum === 2 || lineNum === 6 || lineNum === 11)));

                if (isSurahHeaderLine) {
                  return (
                    <div
                      key={`header-${lineNum}`}
                      className="w-full my-0.5 py-1 px-4 rounded-lg bg-gradient-to-r from-indigo-950/80 via-midnight-800 to-indigo-950/80 border border-indigo-500/40 flex items-center justify-between text-indigo-300 font-arabic text-xs sm:text-sm font-bold shadow-md"
                    >
                      <span>۞ سورة {pageInfo?.surahNameArabic}</span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        آياتها {pageInfo?.endAyah}
                      </span>
                    </div>
                  );
                }

                if (isBismillahLine) {
                  return (
                    <div
                      key={`bismillah-${lineNum}`}
                      className="w-full my-0.5 text-center font-quran text-base sm:text-lg text-indigo-200"
                    >
                      بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
                    </div>
                  );
                }

                return (
                  <div
                    key={`line-${lineNum}`}
                    dir="rtl"
                    className="w-full flex items-center justify-center gap-x-1.5 sm:gap-x-2.5 md:gap-x-3.5 whitespace-nowrap overflow-hidden leading-none px-1"
                  >
                    {wordsOnLine.map((word) => {
                      const isVerseEnd = word.char_type_name === 'end';
                      const isWordActive = isCurrentAndPlaying && word.verse_key === activeVerseKey;

                      if (isVerseEnd) {
                        return (
                          <span
                            key={word.id}
                            onClick={() => handleWordClick(word)}
                            className="inline-flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-indigo-400 mx-1 px-1.5 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/40 cursor-pointer hover:bg-indigo-600 hover:text-white transition"
                            title={t('common.ayah', { number: word.verse_key as unknown as number })}
                          >
                            {word.verse_number}
                          </span>
                        );
                      }

                      return (
                        <span
                          key={word.id}
                          onClick={() => handleWordClick(word)}
                          className={`font-quran text-base sm:text-lg md:text-xl lg:text-2xl transition-colors cursor-pointer rounded px-0.5 ${
                            isWordActive
                              ? 'text-indigo-300 bg-indigo-500/25 font-bold'
                              : 'text-slate-100 hover:text-indigo-300'
                          }`}
                          title={t('common.ayah', { number: word.verse_key as unknown as number })}
                        >
                          {word.text_uthmani}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Authentic Page Bottom Footer */}
        <div className="w-full flex items-center justify-center py-2.5 border-t border-midnight-800 select-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-midnight-800 border border-midnight-700 font-mono text-xs font-bold text-indigo-400 shadow-sm">
              {t('mushaf.pageFooterLabel', { page: formatNumber(pageNumber, currentLang) as unknown as number })}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Ayah Interactive Modal */}
      <MushafAyahModal
        verse={selectedVerse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlayAyah={(vKey) => {
          if (onAyahClick) onAyahClick(vKey);
        }}
        isBookmarked={selectedVerse ? isVerseBookmarked(selectedVerse.verse_key) : false}
        onToggleBookmark={(v) => {
          if (onToggleBookmark && selectedVerse) {
            onToggleBookmark({
              verseKey: v.verse_key,
              verseNumber: v.verse_number,
              surahId: Number(v.verse_key.split(':')[0]),
              pageNumber,
              surahName: pageInfo?.surahNameArabic,
            });
          }
        }}
      />
    </div>
  );
};

export default MushafPageRenderer;
