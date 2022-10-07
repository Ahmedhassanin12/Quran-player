import React, { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { mainPlay } from "../assets";
import PlayPause from "./PlayPause";
import { playPause, setActiveSura } from "../redux/features/playerSlice";
import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from "../redux/services/quranCore";

const TopChartCard = ({
  sura,
  i,
  isPlaying,
  activeSura,
  handlePauseClick,
  handlePlayClick,
  audioData,
}) => (
  <div
    className={`w-full flex flex-row items-center hover:bg-[#4c426e] ${
      activeSura?.id === sura?.id ? "bg-[#4c426e]" : "bg-transparent"
    } py-2 p-4 rounded-lg cursor-pointer mb-2`}
  >
    <h3 className="font-bold text-base text-white mr-3">{i + 1}.</h3>
    <div className="flex-1 flex flex-row justify-between items-center">
      <img className="w-20 h-20 rounded-lg" src={mainPlay} alt={sura?.id} />
      <div className="flex-1 flex flex-col justify-center mx-3">
        <Link to={`/surah/${sura.id}`}>
          <p className="text-xl font-bold text-white">{sura.name_arabic}</p>
        </Link>
        <Link to={`/surah/${sura.id}`}>
          <p className="text-base text-gray-300 mt-1">{sura.name_simple}</p>
        </Link>
      </div>
    </div>
    <PlayPause
      isPlaying={isPlaying}
      activeSura={activeSura}
      sura={sura}
      audioData={audioData}
      handlePause={handlePauseClick}
      handlePlay={handlePlayClick}
    />
  </div>
);
// /************************ /*
const TopPlay = () => {
  const dispatch = useDispatch();
  const { activeSura, isPlaying } = useSelector((state) => state.player);
  const { data } = useGetAllChaptersQuery();
  const { data: audioData } = useGetAllSurahAudioQuery(1);

  let allData = [];

  for (let i = 0; i < audioData?.audio_files?.length; i++) {
    allData.push({ ...audioData.audio_files[i], ...data?.chapters[i] });
  }

  const divRef = useRef(null);

  useEffect(() => {
    divRef.current.scrollIntoView({ behavior: "smooth" });
  });

  const topPlays = allData.sort(() => 0.5 - Math.random()).slice(0, 5);

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = (sura, i) => {
    dispatch(setActiveSura({ sura, data, i }));
    dispatch(playPause(true));
  };

  return (
    <div
      ref={divRef}
      className="xl:ml-6 ml-0 xl:mb-0 mb-6 flex-1 xl:max-w-[500px] max-w-full flex flex-col"
    >
      <div className="w-full flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white font-bold text-2xl">Most Listened</h2>
          {/* <Link to="/top-Surah">
            <p className="text-gray-300 text-base cursor-pointer">See more</p>
          </Link> */}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {topPlays?.map((sura, i) => (
            <TopChartCard
              key={sura.id}
              sura={sura}
              i={i}
              isPlaying={isPlaying}
              activeSura={activeSura}
              audioData={audioData?.audio_files}
              handlePauseClick={handlePauseClick}
              handlePlayClick={() => handlePlayClick(sura, i)}
            />
          ))}
        </div>
      </div>

      {/* <div className="w-full flex flex-col mt-8">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white font-bold text-2xl">Top Artists</h2>
          <Link to="/top-artists">
            <p className="text-gray-300 text-base cursor-pointer">See more</p>
          </Link>
        </div>

        <Swiper
          slidesPerView="auto"
          spaceBetween={15}
          freeMode
          centeredSlides
          centeredSlidesBounds
          modules={[FreeMode]}
          className="mt-4"
        >
          {topPlays?.slice(0, 5).map((artist) => (
            <SwiperSlide
              key={artist?.key}
              style={{ width: "25%", height: "auto" }}
              className="shadow-lg rounded-full animate-slideright"
            >
              <Link to={`/artists/${artist?.artists[0].adamid}`}>
                <img
                  src={artist?.images?.background}
                  alt="Name"
                  className="rounded-full w-full object-cover"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div> */}
    </div>
  );
};

export default TopPlay;
