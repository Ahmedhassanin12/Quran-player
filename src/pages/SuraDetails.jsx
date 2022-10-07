/* eslint-disable no-console */
import { useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { DetailsHeader, Error, Loader } from "../components";
import { setActiveSura, playPause } from "../redux/features/playerSlice";

import {
  useGetSuraAyatQuery,
  useGetChapterIdQuery,
  useGetChapterInfoQuery,
} from "../redux/services/quranCore";

const SuraDetails = (props) => {
  const dispatch = useDispatch();
  const { activeSura, isPlaying } = useSelector((state) => state.player);

  const { surahId } = useParams();

  const {
    data: suraWords,
    isFetching: isFetchSuraWords,
    error,
  } = useGetSuraAyatQuery(surahId);

  const { data: capterSura, isFetching: isFetchSuraDetails } =
    useGetChapterIdQuery(surahId);

  const { data: suraInfo, isFetching: isFetchSuraInfo } =
    useGetChapterInfoQuery(surahId);

  console.log(suraInfo);

  if (isFetchSuraDetails || isFetchSuraWords) <Loader />;

  if (error) <Error />;

  return (
    <div className="flex flex-col">
      <DetailsHeader readerId="" capterSura={capterSura} />
      <h2 className="text-white font-bold mp-4">Sura Info : </h2>
      <div className="text-slate-200 my-6">
        {suraInfo?.chapter_info.short_text}
      </div>

      <div className="mb-10">
        <h2 className="text-white text-3xl font-bold">Quranic verses</h2>

        <div className="mt-5 flex flex-col items-center">
          {suraWords ? (
            suraWords?.verses?.map((line) => (
              <p key={line.id} className="text-gray-400 text-base leading-9">
                {line.text_imlaei}
                <span className="w-25 h-25 rounded-full p-1 bg-slate-300 text-gray-700 text-base">
                  {line.verse_key.split(":").slice(1).join()}
                </span>
              </p>
            ))
          ) : (
            <p className="text-gray-400 text-base">
              Sorry, no quran page found!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuraDetails;
