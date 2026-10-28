import React from 'react';

export interface RubElHizbIconProps {
  className?: string;
}

export const RubElHizbIcon: React.FC<RubElHizbIconProps> = ({
  className = 'w-6 h-6 text-indigo-400',
}) => (
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

export type MedallionSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SurahMedallionProps {
  number?: number | string;
  nameArabic?: string;
  size?: MedallionSize;
  isPlaying?: boolean;
  className?: string;
}

export const SurahMedallion: React.FC<SurahMedallionProps> = ({
  number,
  nameArabic,
  size = 'md',
  isPlaying = false,
  className = '',
}) => {
  const sizeMap: Record<MedallionSize, string> = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-32 h-32 text-xl',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border transition-all ${
        isPlaying
          ? 'bg-midnight-800 border-indigo-500/70 ring-1 ring-indigo-500/40 shadow-sm'
          : 'bg-midnight-850/90 border-midnight-700/70 hover:border-midnight-600'
      } ${dimension} ${className}`}
    >
      {/* Subtle Inner Ring */}
      <div className="absolute inset-0.5 rounded-full border border-white/[0.04] pointer-events-none" />

      {/* Center Surah Number / Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
        {number && (
          <span
            className={`font-semibold font-mono tracking-tight ${
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
        <div className="absolute bottom-1 flex items-center justify-center space-x-0.5 z-20">
          <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          <span className="w-0.5 h-2 bg-indigo-300 rounded-full animate-pulse [animation-delay:0.2s]" />
          <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
      )}
    </div>
  );
};

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ReciterAvatarProps {
  photoUrl?: string | null;
  name?: string;
  arabicName?: string;
  size?: AvatarSize;
  isPlaying?: boolean;
  className?: string;
}

export const ReciterAvatar: React.FC<ReciterAvatarProps> = ({
  photoUrl,
  name,
  arabicName,
  size = 'md',
  isPlaying = false,
  className = '',
}) => {
  const sizeMap: Record<AvatarSize, string> = {
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
      className={`relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border transition-all ${
        isPlaying
          ? 'bg-midnight-800 border-indigo-500/80 ring-2 ring-indigo-500/30'
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
            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (next) {
              next.style.display = 'flex';
            }
          }}
        />
      ) : null}

      {/* Graceful Calligraphic Nocturnal Seal Fallback */}
      <div
        style={{ display: photoUrl ? 'none' : 'flex' }}
        className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-midnight-850 via-midnight-800 to-indigo-950/30"
      >
        <span className="font-arabic text-indigo-300 font-bold text-base select-none">
          {arabicName ? arabicName.split(' ')[0] : initials}
        </span>
        <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
          قارئ
        </span>
      </div>
    </div>
  );
};
