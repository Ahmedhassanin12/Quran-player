import React from "react";
import { FaPauseCircle, FaPlayCircle } from "react-icons/fa";

const PlayPause = ({
  isPlaying,
  activeSura,
  sura,
  handlePause,
  handlePlay,
}) => {
  return isPlaying && activeSura?.name_simple === sura?.name_simple ? (
    <FaPauseCircle size={35} className="text-gray-300" onClick={handlePause} />
  ) : (
    <FaPlayCircle size={35} className="text-gray-300" onClick={handlePlay} />
  );
};

export default PlayPause;
