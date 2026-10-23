import React from 'react';

export const RubElHizbIcon = ({ className = 'w-6 h-6 text-gold-400' }) => (
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
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-40 h-40 text-xl',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-charcoal-800 to-charcoal-900 shadow-lg ${dimension} ${
        isPlaying ? 'ring-2 ring-emerald-500/60 shadow-emerald-950/50' : ''
      } ${className}`}
    >
      {/* Decorative Islamic Background Pattern */}
      <div className="absolute inset-0 opacity-15 bg-islamic-pattern" />

      {/* Decorative Geometric Rings */}
      <div className="absolute inset-1 rounded-xl border border-gold-500/20" />
      <div className="absolute inset-2 rounded-lg border border-emerald-500/10" />

      {/* Center Rub el Hizb Badge or Surah Number */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
        {number && (
          <span className="font-semibold text-gold-400/90 tracking-tighter">
            {number}
          </span>
        )}
        {nameArabic && size !== 'sm' && (
          <span className="font-arabic text-emerald-300 text-xs mt-0.5 line-clamp-1 font-bold">
            {nameArabic}
          </span>
        )}
      </div>

      {/* Active playing indicator glow */}
      {isPlaying && (
        <div className="absolute bottom-1 flex items-center justify-center space-x-0.5 z-20">
          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="w-1 h-3 bg-emerald-300 rounded-full animate-pulse [animation-delay:0.2s]" />
          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.4s]" />
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
    xl: 'w-36 h-36 text-xl',
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
      className={`relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-charcoal-800 to-charcoal-900 shadow-lg ${dimension} ${
        isPlaying ? 'ring-2 ring-emerald-500 shadow-emerald-900/60' : ''
      } ${className}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            // Gracefully switch to calligraphy fallback if image fails to load
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}

      {/* Graceful Calligraphic / Geometric Seal Fallback */}
      <div
        style={{ display: photoUrl ? 'none' : 'flex' }}
        className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-charcoal-800 via-charcoal-850 to-emerald-950/40"
      >
        <div className="absolute inset-1.5 rounded-xl border border-gold-500/25" />
        <span className="font-arabic text-gold-400 font-bold text-lg select-none">
          {arabicName ? arabicName.split(' ')[0] : initials}
        </span>
        <span className="text-[10px] text-emerald-400/80 font-medium tracking-wide uppercase mt-0.5">
          قارئ
        </span>
      </div>

      {isPlaying && (
        <div className="absolute inset-0 bg-emerald-950/30 ring-2 ring-emerald-400/80 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};
