import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Error, Loader, SurahCard } from "../components";

import {
  useGetAllChaptersQuery,
  useGetAllSurahAudioQuery,
} from "../redux/services/quranCore";

import { selectGenreListId } from "../redux/features/playerSlice";

const Discover = () => {
  const dispatch = useDispatch();

  const { activeSura, isPlaying } = useSelector((state) => state.player);
  const { data: surahData, isFetching, error } = useGetAllChaptersQuery();
  const { data: audioData } = useGetAllSurahAudioQuery(1);

  let allData = [];

  for (let i = 0; i < audioData?.audio_files?.length; i++) {
    allData.push({  ...audioData.audio_files[i], ...surahData.chapters[i] });
  }
  // console.log(allData);
  if (isFetching) return <Loader title="Loading Quran..." />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col">
      <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <h2 className="font-bold text-3xl text-white">Discover Quran</h2>
      </div>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {allData.map((sura, i) => (
          <SurahCard
            key={sura.id}
            sura={sura}
            i={i}
            data={allData}
            audioData={audioData?.audio_files}
            isPlaying={isPlaying}
            activeSura={activeSura}
          />
        ))}
      </div>
    </div>
  );
};

export default Discover;
