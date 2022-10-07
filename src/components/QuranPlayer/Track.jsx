import React from "react";
import { mainPlay } from "../../assets";

const Track = ({ isPlaying, isActive, activeSura }) => (
  <div className="flex-1 flex items-center justify-start">
    <div
      className={`${
        isPlaying && isActive ? "animate-[spin_5s_linear_infinite]" : ""
      } hidden sm:block h-16 w-16 mr-4`}
    >
      <img src={mainPlay} alt="cover art" className="w-12 h-12 rounded-full" />
    </div>
    <div className="w-[50%]">
      <p className="truncate text-white font-bold text-lg">
        {activeSura?.name_simple ? activeSura?.name_simple : "No active Sura"}
      </p>
      <p className="truncate text-gray-300">
        {activeSura?.name_arabic ? activeSura?.name_arabic : "No active Sura"}
      </p>
    </div>
  </div>
);

export default Track;
