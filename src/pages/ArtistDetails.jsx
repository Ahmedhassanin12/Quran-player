import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DetailsHeader, Error, Loader } from "../components";
import { SurahCard } from "../components";
import {
  useGetAllSurahAudioQuery,
  useGetAllChaptersQuery,
} from "../redux/services/quranCore";

const ArtistDetails = (props) => {
  const { id: readerId } = useParams();
  const { activeSura, isPlaying } = useSelector((state) => state.player);
  const {
    data: readerData,
    isFetching: isFetchingArtistDetails,
    error,
  } = useGetAllSurahAudioQuery(readerId);

  const { data: surahData, isFetching } = useGetAllChaptersQuery();

  const location = useLocation();

  let allData = [];

  for (let i = 0; i < readerData?.audio_files?.length; i++) {
    allData.push({ ...readerData.audio_files[i], ...surahData?.chapters[i] });
  }

  console.log(allData);

  if (isFetchingArtistDetails)
    return <Loader title="Loading artist details..." />;

  if (error) return <Error />;

  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2   grid-rows-3">
      <div className="col-span-full">
        <DetailsHeader
          readerId={readerId}
          readerData={readerData}
          readerName={location.state.reader}
        />
      </div>
      {allData.map((sura, i) => (
        <div className="mb-5 " key={i}>
          <SurahCard
            key={sura.id}
            sura={sura}
            i={i}
            data={allData}
            // audioData={audioData?.audio_files}
            isPlaying={isPlaying}
            activeSura={activeSura}
          />
        </div>
      ))}

      {/* <p>{location.state.reader}</p> */}
      {/* <RelatedSongs
        // data={Object.values(artistData?.songs)}
        readerId={readerId}
        isPlaying={isPlaying}
        activeSong={activeSong}
      /> */}
    </div>
  );
};

export default ArtistDetails;
