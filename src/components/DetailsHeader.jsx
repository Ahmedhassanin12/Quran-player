/* eslint-disable no-console */
import { Link } from "react-router-dom";
import { mainPlay } from "../assets";

const DetailsHeader = ({ readerId, readerData, capterSura, readerName }) => {
  console.log(readerData);

  return (
    <div className="relative w-full flex flex-col">
      <div className="w-full bg-gradient-to-l from-transparent to-black sm:h-48 h-28">
        <div className="absolute inset-0 flex items-center">
          <img
            src={mainPlay}
            alt="art"
            className="sm:w-48 w-28 sm:h-48 h-28 rounded-full object-cover border-2 shadow-xl shadow-black"
          />
          <div className="ml-5">
            <p className="text-white font-bold sm:text-3xl text-xl">
              {readerId ? readerName : capterSura?.chapter.name_arabic}
            </p>

            <p className="text-base text-gray-400 mt-2">
              {capterSura?.chapter.name_simple}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full sm:h-44 h-24" />
      {!readerId && (
        <p className=" text-gray-400 text-2xl mt-2 mb-5">
          revelation place :{" "}
          <span className="text-white">
            {" "}
            {capterSura?.chapter.revelation_place}
          </span>
        </p>
      )}
      {!readerId && (
        <p className=" text-gray-400 text-2xl mt-2 mb-5">
          verses count :{" "}
          <span className="text-white">
            {" "}
            {capterSura?.chapter.verses_count}
          </span>
        </p>
      )}
    </div>
  );
};

export default DetailsHeader;
