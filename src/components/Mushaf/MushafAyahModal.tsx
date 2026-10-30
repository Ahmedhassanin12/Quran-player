import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillPlayFill, BsBookmark, BsBookmarkFill, BsCheck2 } from 'react-icons/bs';
import { RiCloseLine } from 'react-icons/ri';
import { FiCopy } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';
import { normalizeLanguage } from '../../i18n';
import type { Verse } from '../../types/quran';

export interface MushafAyahModalProps {
  verse: (Verse & { translation?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayAyah: (verseKey: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (verse: Verse) => void;
}

const MushafAyahModal: React.FC<MushafAyahModalProps> = ({
  verse,
  isOpen,
  onClose,
  onPlayAyah,
  isBookmarked,
  onToggleBookmark,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !verse) return null;

  const translationText = verse.translations?.[0]?.text?.replace(/<sup.*?<\/sup>/g, '')
    || verse.translation
    || '';

  const [surahNum, ayahNum] = (verse.verse_key || '1:1').split(':');

  const handleCopy = () => {
    const textToCopy = `${verse.text_uthmani} [${verse.verse_key}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-slowfade select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-midnight-900 border border-midnight-700/80 rounded-t-3xl sm:rounded-xl p-6 shadow-2xl overflow-hidden text-start"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-700/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-midnight-800 border border-indigo-500/30 px-3 py-1 rounded-full">
              {t('mushaf.ayahModal.ayahBadge', { surah: surahNum, ayah: ayahNum })}
            </span>
            <span className="text-xs text-slate-400">
              {t('mushaf.page', { current: formatNumber(verse.page_number || 1, currentLang) as unknown as number })} •{' '}
              {t('mushaf.juz', { number: formatNumber(verse.juz_number || 1, currentLang) as unknown as number })}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-midnight-800 transition"
            aria-label={t('common.close')}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Sacred Verse Text (Always RTL & Arabic) */}
        <p
          lang="ar"
          dir="rtl"
          className="font-quran text-2xl sm:text-3xl leading-[2.6] text-slate-100 my-4 text-center"
        >
          {verse.text_uthmani}
          <span className="inline-flex items-center justify-center font-sans font-bold text-xs text-indigo-400 mx-2 px-2.5 py-0.5 rounded-full bg-midnight-800 border border-indigo-500/30 align-middle">
            {verse.verse_number}
          </span>
        </p>

        {/* English Translation (Always LTR) */}
        {translationText && (
          <div dir="ltr" lang="en" className="my-4 p-4 rounded-lg bg-midnight-850/80 border border-midnight-750 text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
              {t('mushaf.ayahModal.translationHeader')}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {translationText}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-midnight-700/60">
          {/* Play Ayah */}
          <button
            type="button"
            onClick={() => {
              onPlayAyah(verse.verse_key);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-950/60 transition"
          >
            <BsFillPlayFill size={16} />
            <span>{t('mushaf.ayahModal.listenAyah')}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => onToggleBookmark(verse)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition ${
              isBookmarked
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-midnight-800 hover:bg-midnight-750 border-midnight-700 text-slate-300'
            }`}
          >
            {isBookmarked ? <BsBookmarkFill size={14} /> : <BsBookmark size={14} />}
            <span>{isBookmarked ? t('mushaf.ayahModal.bookmarked') : t('mushaf.ayahModal.bookmarkAyah')}</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-midnight-800 hover:bg-midnight-750 border border-midnight-700 text-slate-300 text-xs font-semibold transition"
          >
            {copied ? <BsCheck2 size={15} className="text-emerald-400" /> : <FiCopy size={14} />}
            <span>{copied ? t('mushaf.ayahModal.copied') : t('mushaf.ayahModal.copyAyah')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MushafAyahModal;
