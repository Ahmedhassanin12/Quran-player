import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { mainPlay } from '../assets';
import PlayPause from './PlayPause';
import { playPause, setActiveSura } from '../redux/features/playerSlice';

const SurahCard = ({ sura, isPlaying, activeSura, i, data }) => {
  const dispatch = useDispatch();

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = () => {
    dispatch(setActiveSura({ sura, i, data }));
    dispatch(playPause(true));
  };

  return (
    <div className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer">
      <div className="relative w-full h-56 group">
        <div
          className={`absolute inset-0 justify-center items-center bg-black bg-opacity-50 group-hover:flex ${
            activeSura?.chapter_id === sura?.id
              ? 'flex bg-black bg-opacity-70'
              : 'hidden'
          }`}
        >
          <PlayPause
            isPlaying={isPlaying}
            activeSura={activeSura}
            sura={sura}
            // audioData={audioData?.audio_files}
            handlePause={handlePauseClick}
            handlePlay={handlePlayClick}
          />
        </div>
        <img
          alt="song_img"
          src={mainPlay}
          className="w-full h-full rounded-lg"
        />
      </div>

      <div className="mt-4 flex flex-col">
        <p className="font-semibold text-sm truncate text-white mt-1">
          <Link
            to={{
              pathname: `/surah/${sura?.id}`,
              state: { ar: sura?.name_arabic, en: sura?.name_simple },
            }}
          >
            {sura?.name_arabic}
          </Link>
        </p>
        <p className="text-sm truncate text-gray-300 mt-1">
          <Link to={`/surah/${sura?.id}`}>{sura?.name_simple}</Link>
        </p>
      </div>
    </div>
  );
};

export default SurahCard;
