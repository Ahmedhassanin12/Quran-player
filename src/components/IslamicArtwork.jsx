import React from 'react';

export const RubElHizbIcon = ({ className = 'w-6 h-6 text-indigo-400' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Interlocking squares forming an 8-pointed Islamic star */}
    <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(0 50 50)" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
    <rect x="20" y="20" width="60" height="60" rx="4" transform="rotate(45 50 50)" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
    <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="4" fill="currentColor" />
  </svg>
);

export const SurahMedallion = ({
  number,
  nameArabic,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  isPlaying = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-36 h-36 text-xl',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-lg overflow-hidden border transition-all ${
        isPlaying
          ? 'bg-midnight-800 border-indigo-500/70 ring-1 ring-indigo-500/40 shadow-sm'
          : 'bg-midnight-850 border-midnight-700/80'
      } ${dimension} ${className}`}
    >
      {/* Center Surah Number / Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
        {number && (
          <span
            className={`font-semibold tracking-tighter ${
              isPlaying ? 'text-indigo-300' : 'text-slate-300'
            }`}
          >
            {number}
          </span>
        )}
        {nameArabic && size !== 'sm' && (
          <span className="font-arabic text-indigo-300 text-xs mt-0.5 line-clamp-1 font-bold">
            {nameArabic}
          </span>
        )}
      </div>

      {/* Playing sound indicator glow */}
      {isPlaying && (
        <div className="absolute bottom-0 flex items-center justify-center space-x-0.5 z-20">
          <span className="w-1 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          <span className="w-1 h-2.5 bg-indigo-300 rounded-full animate-pulse [animation-delay:0.2s]" />
          <span className="w-1 h-1.5 bg-indigo-400 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
      )}
    </div>
  );
};

export const ReciterAvatar = ({
  photoUrl,
  name,
  arabicName,
  size = 'md',
  isPlaying = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-32 h-32 text-xl',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'ق';

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden border transition-all ${
        isPlaying
          ? 'bg-midnight-800 border-indigo-500 ring-2 ring-indigo-500/30'
          : 'bg-midnight-850 border-midnight-700/80'
      } ${dimension} ${className}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}

      {/* Graceful Calligraphic Nocturnal Seal Fallback */}
      <div
        style={{ display: photoUrl ? 'none' : 'flex' }}
        className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-midnight-850 via-midnight-800 to-indigo-950/40"
      >
        <span className="font-arabic text-indigo-300 font-bold text-lg select-none">
          {arabicName ? arabicName.split(' ')[0] : initials}
        </span>
        <span className="text-[10px] text-indigo-400/80 font-medium tracking-wide uppercase mt-0.5">
          قارئ
        </span>
      </div>
    </div>
  );
};
