import React from 'react';
import { ReciterAvatar, SurahMedallion } from './IslamicArtwork';

const DetailsHeader = ({
  readerId,
  readerName,
  readerArabicName,
  readerStyle,
  readerPhoto,
  readerBio,
  chapterData,
}) => {
  const isReciter = Boolean(readerId || readerName);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-midnight-850/60 border border-midnight-700/60 p-4 md:p-6 mb-4 shadow-sm">
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
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
          <div className="flex items-center justify-center md:justify-start space-x-2.5 mb-2 text-xs">
            <span className="font-semibold text-indigo-300/90 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
              {isReciter ? readerStyle || 'Murattal' : 'Holy Quran Chapter'}
            </span>
            {!isReciter && chapterData?.revelation_place && (
              <span className="font-medium text-slate-300 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
                {chapterData.revelation_place.toLowerCase() === 'makkah'
                  ? 'مكية · Meccan'
                  : 'مدنية · Medinan'}
              </span>
            )}
          </div>

          {/* Titles */}
          <div className="flex flex-col md:flex-row md:items-baseline md:space-x-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">
              {isReciter ? readerName : chapterData?.name_simple}
            </h1>
            <span className="font-arabic font-bold text-2xl sm:text-3xl text-indigo-300 mt-1 md:mt-0">
              {isReciter ? readerArabicName : chapterData?.name_arabic}
            </span>
          </div>

          {/* Subtitle / Bio / Stats */}
          {isReciter ? (
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {readerBio || 'Complete Holy Quran Recitation with authentic Tajweed rules.'}
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 mt-2">
              <span>
                Meaning:{' '}
                <strong className="text-slate-200">
                  {chapterData?.translated_name?.name || 'The Holy Quran'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Verses:{' '}
                <strong className="text-indigo-400">
                  {chapterData?.verses_count || '—'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Revelation Order:{' '}
                <strong className="text-slate-200">
                  #{chapterData?.revelation_order}
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
