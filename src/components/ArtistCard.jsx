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
      className={`group relative flex flex-col justify-between p-5 rounded-lg transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-midnight-800 border-indigo-500/70 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
          : 'bg-midnight-850 hover:bg-midnight-750 border-midnight-700/80 hover:border-midnight-600 hover:shadow-md'
      }`}
    >
      {/* Top Header: Style Badge */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
          {style}
        </span>
        {isSelected && (
          <span className="text-[10px] font-semibold text-indigo-200 bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 rounded-full">
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

        {/* Full Arabic Name (Full Width, No Ellipsis) */}
        <h4 className="font-arabic text-xl font-bold text-indigo-300 leading-normal w-full">
          {arabicName}
        </h4>

        {/* English Name (Full Width, Clean Wrap) */}
        <h3 className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-indigo-300 transition-colors mt-0.5 leading-snug w-full">
          {englishName}
        </h3>
      </div>

      {/* Divider */}
      <div className="relative z-10 my-3 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />

      {/* Bottom Bar: Surah Count & Select Button */}
      <div className="relative z-10 flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400">
          114 Surahs
        </span>

        <button
          type="button"
          onClick={handleSelectReciter}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isSelected
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-950/50'
              : 'bg-midnight-750 hover:bg-indigo-600 hover:text-white text-slate-200'
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
