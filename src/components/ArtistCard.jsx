import React from "react";
import { useNavigate } from "react-router-dom";
import { mainPlay } from "../assets";
const ArtistCard = ({ reader }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col w-[250px] p-4 bg-white/5 bg-opacity-80 backdrop-blur-sm animate-slideup rounded-lg cursor-pointer"
      onClick={() =>
        navigate(`/reader/${reader?.id}`, {
          state: {
            reader: reader.reciter_name || reader,
          },
        })
      }
    >
      <img alt="song_img" src={mainPlay} className="w-full h-56 rounded-lg" />
      {/* <p className="mt-4 font-semibold text-lg text-white truncate">
        {reader?.id}
      </p> */}
      <p className="mt-4 font-semibold text-lg text-white truncate">
        {reader?.reciter_name}
      </p>
      <p className="mt-4 font-semibold text-lg text-white truncate">
        {reader?.style || "Murattal"}
      </p>
    </div>
  );
};

export default ArtistCard;
