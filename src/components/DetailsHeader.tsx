import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReciterAvatar, SurahMedallion } from './IslamicArtwork';
import { formatNumber } from '../utils/formatters';
import { normalizeLanguage } from '../i18n';
import type { Chapter } from '../types/quran';

export interface DetailsHeaderProps {
  readerId?: number | string;
  readerName?: string;
  readerArabicName?: string;
  readerStyle?: string;
  readerPhoto?: string | null;
  readerBio?: string;
  chapterData?: Partial<Chapter> | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  reciterName?: string;
  prevSurahId?: number | null;
  nextSurahId?: number | null;
}

const DetailsHeader: React.FC<DetailsHeaderProps> = ({
  readerId,
  readerName,
  readerArabicName,
  readerStyle,
  readerPhoto,
  readerBio,
  chapterData,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const isReciter = Boolean(readerId || readerName);

  const styleKey = (readerStyle || 'Murattal') as 'Murattal' | 'Mujawwad' | 'Muallim';
  const localizedStyle = t(`reciters.styles.${styleKey}`, { defaultValue: readerStyle || 'Murattal' });

  const bioKey = String(readerId || '7') as '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
  const localizedBio = t(`reciters.bios.${bioKey}`, {
    defaultValue: readerBio || t('detailsHeader.defaultReciterBio'),
  });

  const isMeccan = String(chapterData?.revelation_place || 'makkah').toLowerCase() === 'makkah';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-midnight-850/60 border border-midnight-700/60 p-4 md:p-6 mb-4 shadow-sm">
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-start">
        {isReciter ? (
          <ReciterAvatar
            photoUrl={readerPhoto}
            name={readerName}
            arabicName={readerArabicName}
            size="lg"
            className="shadow-xl shadow-black/60"
          />
        ) : (
          <SurahMedallion
            number={chapterData?.id}
            nameArabic={chapterData?.name_arabic}
            size="lg"
            className="shadow-xl shadow-black/60"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Top category / style info */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2 text-xs">
            <span className="font-semibold text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
              {isReciter ? localizedStyle : t('detailsHeader.holyQuranChapter')}
            </span>
            {!isReciter && chapterData?.revelation_place && (
              <span className="font-medium text-slate-300 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
                {isMeccan ? t('common.meccan') : t('common.medinan')}
              </span>
            )}
          </div>

          {/* Titles */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              {isReciter ? readerName : chapterData?.name_simple}
            </h1>
            <span className="font-arabic font-bold text-2xl sm:text-3xl text-slate-200 mt-1 md:mt-0" lang="ar" dir="rtl">
              {isReciter ? readerArabicName : chapterData?.name_arabic}
            </span>
          </div>

          {/* Subtitle / Bio / Stats */}
          {isReciter ? (
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {localizedBio}
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 mt-2">
              <span>
                {t('detailsHeader.meaning')}{' '}
                <strong className="text-slate-200">
                  {chapterData?.translated_name?.name || t('common.holyQuran')}
                </strong>
              </span>
              <span>•</span>
              <span>
                {t('detailsHeader.verses')}{' '}
                <strong className="text-indigo-400">
                  {chapterData?.verses_count
                    ? formatNumber(chapterData.verses_count, currentLang)
                    : '—'}
                </strong>
              </span>
              <span>•</span>
              <span>
                {t('detailsHeader.revelationOrder')}{' '}
                <strong className="text-slate-200" dir="ltr">
                  #{chapterData?.revelation_order ? formatNumber(chapterData.revelation_order, currentLang) : '—'}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsHeader;
