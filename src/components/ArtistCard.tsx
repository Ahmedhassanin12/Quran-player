import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsFillPlayFill } from 'react-icons/bs';
import { ReciterAvatar } from './IslamicArtwork';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setReciter, selectCurrentReciter, selectIsPlaying } from '../redux/features/playerSlice';
import { getReciterById } from '../assets/recitersData';
import type { Reciter } from '../types/reciter';

export interface ArtistCardProps {
  reader?: Partial<Reciter> & { translated_name?: { name: string } };
}

const ArtistCard: React.FC<ArtistCardProps> = ({ reader }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentReciter = useAppSelector(selectCurrentReciter);
  const isPlaying = useAppSelector(selectIsPlaying);

  const verified = getReciterById(reader?.id || 7);
  const reciterId = reader?.id || verified.id;
  const englishName = reader?.reciter_name || reader?.translated_name?.name || verified.reciter_name;
  const arabicName = verified.arabic_name || reader?.translated_name?.name || 'القارئ';
  const style = reader?.style || verified.style || 'Murattal';
  const photoUrl = verified.photo_url;
  const isSelected = currentReciter?.id === reciterId;

  const handleSelectReciter = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      setReciter({
        id: reciterId,
        reciter_name: englishName,
        arabic_name: arabicName,
        style,
        photo_url: photoUrl,
        surahs_count: 114,
      }),
    );
  };

  const handleCardClick = () => {
    navigate(`/reader/${reciterId}`, {
      state: {
        reader: {
          id: reciterId,
          reciter_name: englishName,
          arabic_name: arabicName,
          style,
          photo_url: photoUrl,
          surahs_count: 114,
        },
      },
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-5 rounded-xl transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-midnight-800/90 border-indigo-500/60 shadow-lg shadow-black/40 ring-1 ring-indigo-500/30'
          : 'bg-midnight-850/60 hover:bg-midnight-800/80 border-midnight-700/60 hover:border-midnight-600 hover:shadow-md'
      }`}
    >
      {/* Top Header: Style Badge & Active Indicator */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-midnight-800 border border-midnight-700 px-2.5 py-0.5 rounded-full">
          {style}
        </span>
        {isSelected && (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {/* Center: Reciter Portrait & Names */}
      <div className="relative z-10 flex flex-col items-center text-center my-2">
        <ReciterAvatar
          photoUrl={photoUrl}
          name={englishName}
          arabicName={arabicName}
          size="lg"
          isPlaying={isSelected && isPlaying}
          className="shadow-md shadow-black/60 mb-3"
        />

        {/* Full Arabic Name */}
        <h4 className="font-arabic text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-normal w-full">
          {arabicName}
        </h4>

        {/* English Name */}
        <h3 className="font-semibold text-sm text-slate-300 mt-0.5 leading-snug w-full">
          {englishName}
        </h3>
      </div>

      {/* Bottom Bar: Surah Count & Select Button */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-midnight-700/40">
        <span className="text-xs text-slate-400 font-mono">
          114 Surahs
        </span>

        <button
          type="button"
          onClick={handleSelectReciter}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isSelected
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'bg-midnight-800 hover:bg-midnight-750 text-slate-300 hover:text-white border border-midnight-700/80'
          }`}
        >
          <BsFillPlayFill size={14} />
          <span>{isSelected ? 'Selected' : 'Select'}</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ArtistCard);
