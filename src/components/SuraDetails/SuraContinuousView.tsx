import React from 'react';
import { toArabicDigits } from '../../utils/formatters';
import type { Verse } from '../../types';

export interface SuraContinuousViewProps {
  verses: Verse[];
  showBismillah: boolean;
  isCurrentAndPlaying: boolean;
  activeVerseKey: string | null;
  fontSize: string;
  onJumpToVerse: (verseKey: string) => void;
}

export const SuraContinuousView: React.FC<SuraContinuousViewProps> = ({
  verses,
  showBismillah,
  isCurrentAndPlaying,
  activeVerseKey,
  fontSize,
  onJumpToVerse,
}) => (
  <>
    {/* Bismillah Banner (Always sacred Arabic RTL) */}
    {showBismillah && (
      <div className="text-center py-5 bg-midnight-850/40 border border-midnight-700/50 rounded-xl" lang="ar" dir="rtl">
        <p className="font-quran text-3xl sm:text-4xl text-slate-100 tracking-wide select-none">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      </div>
    )}

    <div className="p-6 sm:p-10 rounded-xl bg-midnight-850/60 border border-midnight-700/60 shadow-xl">
      <div
        lang="ar"
        dir="rtl"
        className="leading-[2.8] text-right font-quran text-slate-100 selection:bg-indigo-500/30"
      >
        {verses.map((verse) => {
          const isPlayingThisVerse = isCurrentAndPlaying && activeVerseKey === verse.verse_key;
          return (
            <span
              key={verse.id}
              onClick={() => onJumpToVerse(verse.verse_key)}
              className={`${fontSize} inline transition-all cursor-pointer rounded px-1 ${
                isPlayingThisVerse
                  ? 'bg-indigo-500/20 text-indigo-200 font-medium ring-1 ring-indigo-500/40'
                  : 'hover:text-indigo-300 hover:bg-midnight-800/40'
              }`}
            >
              <span>{verse.text_uthmani}</span>
              <span className="font-arabic text-amber-400/90 font-normal mx-1.5 select-none text-[0.8em] align-middle">
                ﴿{toArabicDigits(verse.verse_number)}﴾
              </span>
            </span>
          );
        })}
      </div>
    </div>
  </>
);

export default React.memo(SuraContinuousView);
