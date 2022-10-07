import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Error, Loader, SurahCard } from "../components";
// import { useGetSongBySearchQuery } from "../redux/services/shazemCore";

const Search = () => {
  const { searchTerm } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  // const { data, isFetching, error } = useGetSongBySearchQuery(searchTerm);

  // const songs = data?.tracks?.hits?.map((song) => song.track);

  // if (isFetching) {
  //   return <Loader title="loading songs" />;
  // }

  // if (error) return <Error />;

  return (
    <div className="flex flex-col">
      <h2 className="font-bold text-white text-3xl mt-4 mb-4">
        Showing results for <span className="font-black">{searchTerm}</span>
      </h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {/* {songs?.map((song, i) => (
          <SongCard
            key={song.key}
            song={song}
            isPlaying={isPlaying}
            activeSong={activeSong}
            data={data}
            i={i}
          />
        ))} */}
      </div>
    </div>
  );
};

export default Search;
