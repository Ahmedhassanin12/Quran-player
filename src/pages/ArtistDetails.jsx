import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BsFillPlayFill } from 'react-icons/bs';
import { DetailsHeader, Error, Loader, SurahCard, Searchbar } from '../components';
import {
  useGetAllSurahAudioQuery,
  useGetAllChaptersQuery,
} from '../redux/services/quranCore';
import { setReciter, setActiveSura, playPause } from '../redux/features/playerSlice';
import { getReciterById } from '../assets/recitersData';

const ArtistDetails = () => {
  const { id: readerId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { activeSura, isPlaying, currentReciter } = useSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState('');

  // Retrieve reciter metadata from verified dataset or location state
  const verifiedReciter = useMemo(() => {
    const fromData = getReciterById(readerId);
    if (fromData) return fromData;
    return location.state?.reader || {
      id: Number(readerId),
      reciter_name: `Reciter ${readerId}`,
      arabic_name: 'قارئ كريم',
      style: 'Murattal',
      photo_url: null,
      surahs_count: 114,
    };
  }, [readerId, location.state]);

  const {
    data: audioData,
    isFetching: isFetchingAudio,
    error: audioError,
  } = useGetAllSurahAudioQuery(readerId);

  const {
    data: surahData,
    isFetching: isFetchingChapters,
    error: chaptersError,
  } = useGetAllChaptersQuery();

  // Audio map by chapter_id
  const audioMap = useMemo(() => {
    const map = {};
    if (audioData?.audio_files && Array.isArray(audioData.audio_files)) {
      audioData.audio_files.forEach((file) => {
        if (file?.chapter_id) {
          map[file.chapter_id] = file;
        }
      });
    }
    return map;
  }, [audioData]);

  // Combined Surah list for this specific reciter
  const reciterSurahs = useMemo(() => {
    if (!surahData?.chapters) return [];

    return surahData.chapters.map((chapter) => {
      const audio = audioMap[chapter.id];
      return {
        ...chapter,
        chapter_id: chapter.id,
        audio_url: audio?.audio_url || '',
        file_size: audio?.file_size,
        reciter_id: Number(readerId),
      };
    });
  }, [surahData, audioMap, readerId]);

  // Filtered by search
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return reciterSurahs;
    const q = searchQuery.toLowerCase().trim();
    return reciterSurahs.filter(
      (s) =>
        String(s.id) === q ||
        s.name_simple?.toLowerCase().includes(q) ||
        s.name_arabic?.includes(q) ||
        s.translated_name?.name?.toLowerCase().includes(q),
    );
  }, [reciterSurahs, searchQuery]);

  const isCurrentReciter = currentReciter?.id === Number(readerId);

  const handleSetAsActiveReciter = () => {
    dispatch(setReciter(verifiedReciter));
    if (reciterSurahs.length > 0) {
      dispatch(
        setActiveSura({
          sura: reciterSurahs[0],
          i: 0,
          data: reciterSurahs,
          reciter: verifiedReciter,
        }),
      );
      dispatch(playPause(true));
    }
  };

  if (isFetchingAudio || isFetchingChapters) {
    return <Loader title="Loading reciter profile & recordings..." />;
  }

  if (audioError || chaptersError) {
    return <Error message="Unable to load reciter profile. Please check your connection." />;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Profile Header */}
      <DetailsHeader
        readerId={readerId}
        readerName={verifiedReciter.reciter_name}
        readerArabicName={verifiedReciter.arabic_name}
        readerStyle={verifiedReciter.style}
        readerPhoto={verifiedReciter.photo_url}
        readerBio={verifiedReciter.bio}
      />

      {/* Reciter Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-midnight-850/80 border border-midnight-700/80">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSetAsActiveReciter}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-950/60 transition-transform transform active:scale-95"
          >
            <BsFillPlayFill size={20} />
            <span>Play Full Quran</span>
          </button>

          {isCurrentReciter ? (
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
              ✓ Active Reciter
            </span>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(setReciter(verifiedReciter))}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-midnight-750 hover:bg-midnight-700 transition-colors"
            >
              Set as Default
            </button>
          )}
        </div>

        <Searchbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter surahs in this recitation..."
        />
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredSurahs.map((sura, i) => (
          <SurahCard
            key={sura.id}
            sura={sura}
            i={i}
            data={filteredSurahs}
            audioData={audioData?.audio_files}
            isPlaying={isPlaying}
            activeSura={activeSura}
            currentReciter={verifiedReciter}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtistDetails;
