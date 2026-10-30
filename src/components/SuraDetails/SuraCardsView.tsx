import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillPlayFill } from 'react-icons/bs';
import { toArabicDigits, formatNumber } from '../../utils/formatters';
import { normalizeLanguage } from '../../i18n';
import type { Verse } from '../../types';

export interface SuraCardsViewProps {
  verses: Verse[];
  showBismillah: boolean;
  isCurrentAndPlaying: boolean;
  activeVerseKey: string | null;
  fontSize: string;
  showTranslation: boolean;
  onJumpToVerse: (verseKey: string) => void;
}

export const SuraCardsView: React.FC<SuraCardsViewProps> = ({
  verses,
  showBismillah,
  isCurrentAndPlaying,
  activeVerseKey,
  fontSize,
  showTranslation,
  onJumpToVerse,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeVerseRef.current && isCurrentAndPlaying) {
      activeVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeVerseKey, isCurrentAndPlaying]);

  return (
    <>
      {/* Bismillah Banner (Always sacred Arabic RTL) */}
      {showBismillah && (
        <div className="text-center py-5 bg-midnight-850/40 border border-midnight-700/50 rounded-xl" lang="ar" dir="rtl">
          <p className="font-quran text-3xl sm:text-4xl text-slate-100 tracking-wide select-none">
            {t('common.bismillah')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {verses.map((verse) => {
          const isPlayingThisVerse = isCurrentAndPlaying && activeVerseKey === verse.verse_key;
          const translationText = verse.translations?.[0]?.text?.replace(/<sup.*?<\/sup>/g, '') || '';

          return (
            <div
              key={verse.id}
              ref={isPlayingThisVerse ? activeVerseRef : null}
              onClick={() => onJumpToVerse(verse.verse_key)}
              className={`p-5 sm:p-6 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                isPlayingThisVerse
                  ? 'bg-midnight-800/95 border-indigo-500/60 shadow-lg shadow-black/40 ring-1 ring-indigo-500/30'
                  : 'bg-midnight-850/50 hover:bg-midnight-800/70 border-midnight-700/50 hover:border-midnight-600/60'
              }`}
            >
              {/* Header Row: Verse Index + Jump-to-verse trigger */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-midnight-700/30 select-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">
                    {t('common.ayah', { number: formatNumber(verse.verse_number, currentLang) as unknown as number })} ·{' '}
                    <span className="font-mono text-slate-500" dir="ltr">{verse.verse_key}</span>
                  </span>
                  {isPlayingThisVerse && (
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t('suraDetails.playingNow')}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJumpToVerse(verse.verse_key);
                  }}
                  title={t('suraDetails.playAyahTitle', { number: verse.verse_number })}
                  className="text-xs text-slate-400 group-hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  <BsFillPlayFill size={15} />
                  <span>{t('mushaf.ayahModal.listenAyah')}</span>
                </button>
              </div>

              {/* Sacred Uthmani Arabic Text (Always RTL & right-aligned regardless of UI language) */}
              <p
                lang="ar"
                dir="rtl"
                className={`font-quran text-right ${fontSize} leading-[2.6] text-slate-100 ${
                  isPlayingThisVerse ? 'text-indigo-200' : 'text-slate-100'
                }`}
              >
                {verse.text_uthmani}
                <span className="font-arabic text-amber-400/90 font-normal mx-2 select-none text-[0.85em] align-middle">
                  ﴿{toArabicDigits(verse.verse_number)}﴾
                </span>
              </p>

              {/* Saheeh International English Translation (Always LTR) */}
              {showTranslation && translationText && (
                <p
                  lang="en"
                  dir="ltr"
                  className="text-left text-xs sm:text-sm text-slate-400 font-sans mt-3 pt-3 border-t border-midnight-700/30 leading-relaxed"
                >
                  {translationText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default React.memo(SuraCardsView);
