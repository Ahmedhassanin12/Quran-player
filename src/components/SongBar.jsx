import React from "react";
import { Link } from "react-router-dom";
import { mainPlay } from "../assets";
import PlayPause from "./PlayPause";

const SongBar = ({
  sura,
  i,
  artistId,
  isPlaying,
  activeSong,
  handlePauseClick,
  handlePlayClick,
}) => (
  <div
    className={`w-full flex flex-row items-center hover:bg-[#4c426e] ${
      activeSong?.id === sura?.id ? "bg-[#4c426e]" : "bg-transparent"
    } py-2 p-4 rounded-lg cursor-pointer mb-2`}
  >
    <h3 className="font-bold text-base text-white mr-3">{i + 1}.</h3>
    <div className="flex-1 flex flex-row justify-between items-center">
      <img className="w-20 h-20 rounded-lg" src={mainPlay} alt={sura?.title} />
      <div className="flex-1 flex flex-col justify-center mx-3">
        {!artistId ? (
          <Link to={`/songs/${sura.key}`}>
            <p className="text-xl font-bold text-white">{sura?.title}</p>
          </Link>
        ) : (
          <p className="text-xl font-bold text-white">
            {sura?.attributes?.name}
          </p>
        )}
        <p className="text-base text-gray-300 mt-1">
          {artistId ? sura?.attributes?.albumName : sura?.subtitle}
        </p>
      </div>
    </div>
    {!artistId ? (
      <PlayPause
        isPlaying={isPlaying}
        activeSong={activeSong}
        sura={sura}
        handlePause={handlePauseClick}
        handlePlay={() => handlePlayClick(sura, i)}
      />
    ) : null}
  </div>
);

export default SongBar;
