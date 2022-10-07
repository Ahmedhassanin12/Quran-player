import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

import { Error, Loader, SurahCard } from "../components";
import { useGetAllChaptersQuery, useGetAllSurahAudioQuery } from "../redux/services/quranCore";

const TopSurah = () => {
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const { data: allSura, isFetching, error } = useGetAllChaptersQuery();
  const { data: audioData } = useGetAllSurahAudioQuery(1);
  if (isFetching) {
    return <Loader title="loading quran" />;
  }

  if (error) return <Error />;

  return (
    <div className="flex flex-col">
      <h2 className="font-bold text-white text-3xl mt-4 mb-4">
        Discover Top Sura
      </h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {allSura?.chapters?.map((sura, i) => (
          <SurahCard
            key={sura.id}
            sura={sura}
            audioData={audioData?.audio_files}
            isPlaying={isPlaying}
            activeSong={activeSong}
            i={i}
          />
        ))}
      </div>
    </div>
  );
};

export default TopSurah;
