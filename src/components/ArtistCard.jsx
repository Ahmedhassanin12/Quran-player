import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BsFillPlayFill } from 'react-icons/bs';
import { ReciterAvatar } from './IslamicArtwork';
import { setReciter } from '../redux/features/playerSlice';
import { getReciterById } from '../assets/recitersData';

const ArtistCard = ({ reader }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentReciter, isPlaying } = useSelector((state) => state.player);

  const verified = getReciterById(reader?.id);
  const reciterId = reader?.id || verified.id;
  const englishName = reader?.reciter_name || reader?.translated_name?.name || verified.reciter_name;
  const arabicName = verified.arabic_name || reader?.translated_name?.name || 'القارئ';
  const style = reader?.style || verified.style || 'Murattal';
  const photoUrl = verified.photo_url;
  const isSelected = currentReciter?.id === reciterId;

  const handleSelectReciter = (e) => {
    e.stopPropagation();
    dispatch(
      setReciter({
        id: reciterId,
        reciter_name: englishName,
        arabic_name: arabicName,
        style,
        photo_url: photoUrl,
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
        },
      },
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'bg-gradient-to-br from-charcoal-800 to-emerald-950/40 border-emerald-500/50 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
          : 'bg-charcoal-850/80 hover:bg-charcoal-800/90 border-charcoal-700/60 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      {/* Background subtle Islamic pattern */}
      <div className="absolute inset-0 rounded-2xl opacity-5 bg-islamic-pattern pointer-events-none" />

      {/* Top area: Avatar + Quick Play Action */}
      <div className="relative z-10 flex items-center space-x-3.5">
        <ReciterAvatar
          photoUrl={photoUrl}
          name={englishName}
          arabicName={arabicName}
          size="md"
          isPlaying={isSelected && isPlaying}
        />

        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mb-1">
            {style}
          </span>
          <h3 className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-emerald-300 transition-colors leading-tight line-clamp-2">
            {englishName}
          </h3>
          <p className="font-arabic text-base text-gold-400/90 leading-tight mt-1 truncate">
            {arabicName}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 my-4 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />

      {/* Bottom bar: Recording count & Select/Listen button */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          114 Surahs available
        </span>

        <button
          type="button"
          onClick={handleSelectReciter}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isSelected
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-charcoal-700 hover:bg-emerald-600 hover:text-white text-slate-200'
          }`}
        >
          <BsFillPlayFill size={14} />
          <span>{isSelected ? 'Active Reciter' : 'Select'}</span>
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
