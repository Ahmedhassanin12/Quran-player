import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

import { Error, Loader, SurahCard } from "../components";
// import { useGetSongByCountryQuery } from "../redux/services/shazemCore";

const AroundYou = () => {
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);

  // const { activeSong, isPlaying } = useSelector((state) => state.player);

  // const { data, isFetching, error } = useGetSongByCountryQuery(country);
  console.log(country);

  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://geo.ipify.org/api/v2/country?apiKey=at_hXoPsLthfJTmr8duPrpzL7lzRgFBR&ipAddress=8.8.8.8"
  //     )
  //     .then((res) => {
  //       setCountry(res?.data?.location.country);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => setLoading(false));
  // }, [country]);

  // if (isFetching && loading) {
  //   return <Loader title="loading songs" />;
  // }

  // if (error && country) return <Error />;

  return (
    <div className="flex flex-col">
      <h2 className="font-bold text-white text-3xl mt-4 mb-4">Around You</h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {/* {data?.map((song, i) => (
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

export default AroundYou;
