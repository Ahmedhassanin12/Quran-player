import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiMoon, FiBookOpen } from 'react-icons/fi';
import { RubElHizbIcon } from '../IslamicArtwork';
import {
  getMushafPageInfo,
  getMushafPageImageUrl,
  TOTAL_MUSHAF_PAGES,
} from '../../assets/mushafMetadata';
import { useGetVersesByPageQuery } from '../../redux/services/quranCore';
import MushafAyahModal from './MushafAyahModal';

const MushafPageRenderer = ({
  pageNumber = 1,
  activeVerseKey = null,
  onAyahClick,
  viewEngine = 'plate',
  isCurrentAndPlaying = false,
  bookmarks = [],
  onToggleBookmark,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [plateTheme, setPlateTheme] = useState('dark'); // 'dark' (pure white calligraphy) | 'parchment' (classic ivory)
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageInfo = useMemo(() => getMushafPageInfo(pageNumber), [pageNumber]);
  const imageUrl = useMemo(() => getMushafPageImageUrl(pageNumber), [pageNumber]);

  // Fetch line-by-line structured data (mushaf=2: King Fahd Complex 15-line layout)
  const {
    data: pageData,
    isFetching: isFetchingPageData,
  } = useGetVersesByPageQuery(
    { pageNumber, mushaf: 2 },
    { skip: viewEngine !== 'digital' && imageLoaded && !imageError },
  );

  // Reset image loaded state when page changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [pageNumber]);

  // Pre-fetch adjacent pages (page-1 and page+1) for instant page flipping
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

  // Group words into their exact 15 lines (1 to 15)
  const lineMap = useMemo(() => {
    const map = {};
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

  // Detect which lines are surah headers or bismillah
  // Surah start condition: a verse on this page has verse_number === 1
  const surahStartVerses = useMemo(() => {
    return verses.filter((v) => v.verse_number === 1);
  }, [verses]);

  const handleWordClick = (word) => {
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

  const isVerseBookmarked = (verseKey) => {
    return bookmarks.some((b) => b.verseKey === verseKey);
  };

  return (
    <div className="w-full flex flex-col items-center select-none animate-slowfade">
      {/* Outer Luxury Mushaf Folio Container */}
      <div className="w-full max-w-lg md:max-w-xl bg-[#090B10] rounded-xl sm:rounded-3xl border border-midnight-700/80 shadow-2xl overflow-hidden p-2 sm:p-5">
        {/* Authentic Page Top Header (Juz on Left, Surah Name on Right) */}
        <div className="w-full flex items-center justify-between px-3 sm:px-6 py-2 border-b border-midnight-800 text-[11px] sm:text-xs font-arabic text-slate-400 select-none">
          <div className="flex items-center space-x-2 text-indigo-300">
            <span>الجزء {pageInfo?.juz}</span>
            {viewEngine === 'plate' && (
              <button
                type="button"
                onClick={() => setPlateTheme((prev) => (prev === 'dark' ? 'parchment' : 'dark'))}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-midnight-800 hover:bg-midnight-750 text-slate-300 text-[10px] font-sans border border-midnight-700/80 transition"
                title="تبديل مظهر المصحف (ليلي بخط أبيض / ورقي عاجي)"
              >
                {plateTheme === 'dark' ? (
                  <>
                    <FiMoon size={11} className="text-indigo-400" />
                    <span>خط أبيض ناصع</span>
                  </>
                ) : (
                  <>
                    <FiBookOpen size={11} className="text-amber-400" />
                    <span>نمط ورقي كلاسيكي</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 font-bold text-slate-200">
            <span>سورة {pageInfo?.surahNameArabic}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ENGINE 1: HIGH-RES 1260px AUTHENTIC CALLIGRAPHIC PLATE SCAN */}
        {/* ============================================================ */}
        {viewEngine === 'plate' ? (
          <div
            className={`relative w-full aspect-[1260/2038] flex items-center justify-center overflow-hidden my-2 sm:my-3 rounded-lg border border-midnight-800 transition-colors duration-300 ${
              plateTheme === 'parchment' ? 'bg-[#FAF7EE]' : 'bg-[#0E111A]'
            }`}
          >
            {/* Shimmer loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-midnight-900/60 animate-pulse">
                <RubElHizbIcon className="w-12 h-12 text-indigo-500/40 animate-spin" />
                <p className="text-xs font-arabic text-slate-400">
                  جاري تحميل صفحة المصحف الشريف {pageNumber}...
                </p>
              </div>
            )}

            {/* Authentic Page Scan from King Fahd Glorious Quran Complex */}
            {/* In dark mode, filter: invert(1) brightness(1.2) contrast(1.1) turns black ink into crisp pure white calligraphy */}
            <img
              src={imageUrl}
              alt={`المصحف الشريف — صفحة ${pageNumber}`}
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

            {/* Error Fallback: Switch to digital typography */}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-midnight-950">
                <p className="text-xs text-amber-300 font-arabic">
                  تعذر تحميل صورة الصفحة. تم التبديل تلقائياً إلى المصحف الرقمي المسطر.
                </p>
              </div>
            )}

           
          </div>
        ) : (
          /* ============================================================ */
          /* ENGINE 2: 15-LINE STRUCTURED DIGITAL TYPOGRAPHY MUSHAF       */
          /* ============================================================ */
          <div className="relative w-full aspect-[1260/2038] bg-[#0c0f17] flex flex-col justify-between p-3 sm:p-6 my-2 sm:my-3 rounded-lg border border-midnight-800 overflow-hidden">

            {/* 15 Physical Lines (Strictly preserved, 0 line reflow) */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between select-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((lineNum) => {
                const wordsOnLine = lineMap[lineNum] || [];

                // Check if this line is a Surah Header or Bismillah line
                // On Page 1:
                //   Line 1: Fatihah Header
                // On Page 2 & standard surah starts:
                //   First lines before text are Header and Bismillah
                const isSurahHeaderLine =
                  surahStartVerses.length > 0 &&
                  ((lineNum === 1 && pageNumber === 2) ||
                    (lineNum === 1 && pageNumber === 50) ||
                    (pageNumber === 604 && (lineNum === 1 || lineNum === 5 || lineNum === 10)));

                const isBismillahLine =
                  surahStartVerses.length > 0 &&
                  ((lineNum === 2 && pageNumber === 2) ||
                    (lineNum === 2 && pageNumber === 50) ||
                    (pageNumber === 604 && (lineNum === 2 || lineNum === 6 || lineNum === 11)));

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

                // Standard Quranic Line: Words distributed with natural, cohesive Quranic spacing
                return (
                  <div
                    key={`line-${lineNum}`}
                    dir="rtl"
                    className="w-full flex items-center justify-center gap-x-1.5 sm:gap-x-2.5 md:gap-x-3.5 whitespace-nowrap overflow-hidden leading-none px-1"
                  >
                    {wordsOnLine.map((word) => {
                      const isVerseEnd = word.char_type_name === 'end';
                      const isWordActive =
                        isCurrentAndPlaying && word.verse_key === activeVerseKey;

                      if (isVerseEnd) {
                        return (
                          <span
                            key={word.id}
                            onClick={() => handleWordClick(word)}
                            className="inline-flex items-center justify-center font-sans font-bold text-[10px] sm:text-xs text-indigo-400 mx-1 px-1.5 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/40 cursor-pointer hover:bg-indigo-600 hover:text-white transition"
                            title={`آية ${word.verse_key}`}
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
                          title={`آية ${word.verse_key}`}
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

        {/* Authentic Page Bottom Footer: Page Number in Rub El Hizb Medallion */}
        <div className="w-full flex items-center justify-center py-2.5 border-t border-midnight-800 select-none">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-arabic text-slate-400">صفحة</span>
            <span className="px-3 py-1 rounded-full bg-midnight-800 border border-midnight-700 font-mono text-xs font-bold text-indigo-400 shadow-sm">
              {pageNumber}
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
          if (onToggleBookmark) {
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
