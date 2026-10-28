import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { BsFillPlayFill } from 'react-icons/bs';
import { DetailsHeader, Error, Loader, SurahCard, Searchbar } from '../components';
import {
  useGetAllSurahAudioQuery,
  useGetAllChaptersQuery,
} from '../redux/services/quranCore';
import { setReciter, setActiveSura, playPause } from '../redux/features/playerSlice';
import { getReciterById } from '../assets/recitersData';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type { AudioFile, Surah, VerifiedReciter, Reciter } from '../types';

interface LocationState {
  reader?: VerifiedReciter;
}

const ArtistDetails: React.FC = () => {
  const { id: readerId } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { activeSura, isPlaying, currentReciter } = useAppSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState<string>('');

  const numericReaderId = Number(readerId) || 7;

  // Retrieve reciter metadata from verified dataset or location state
  const verifiedReciter = useMemo<Reciter | VerifiedReciter>(() => {
    const fromData = getReciterById(numericReaderId);
    if (fromData) return fromData;
    const locState = location.state as LocationState | undefined;
    return locState?.reader || {
      id: numericReaderId,
      reciter_name: `Reciter ${numericReaderId}`,
      arabic_name: 'قارئ كريم',
      style: 'Murattal',
      photo_url: '',
      surahs_count: 114,
    };
  }, [numericReaderId, location.state]);

  const {
    data: audioData,
    isFetching: isFetchingAudio,
    error: audioError,
  } = useGetAllSurahAudioQuery(numericReaderId);

  const {
    data: surahData,
    isFetching: isFetchingChapters,
    error: chaptersError,
  } = useGetAllChaptersQuery();

  // Audio map by chapter_id
  const audioMap = useMemo<Record<number, AudioFile>>(() => {
    const map: Record<number, AudioFile> = {};
    if (audioData?.audio_files && Array.isArray(audioData.audio_files)) {
      audioData.audio_files.forEach((file: AudioFile) => {
        if (file?.chapter_id) {
          map[file.chapter_id] = file;
        }
      });
    }
    return map;
  }, [audioData]);

  // Combined Surah list for this specific reciter
  const reciterSurahs = useMemo<Surah[]>(() => {
    if (!surahData?.chapters) return [];

    return surahData.chapters.map((chapter) => {
      const audio = audioMap[chapter.id];
      return {
        ...chapter,
        chapter_id: chapter.id,
        audio_url: audio?.audio_url || '',
        file_size: audio?.file_size,
        reciter_id: numericReaderId,
      };
    });
  }, [surahData, audioMap, numericReaderId]);

  // Filtered by search
  const filteredSurahs = useMemo<Surah[]>(() => {
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

  const isCurrentReciter = currentReciter?.id === numericReaderId;

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
    <div className="flex flex-col space-y-3">
      {/* Profile Header */}
      <DetailsHeader
        readerId={numericReaderId}
        readerName={verifiedReciter.reciter_name}
        readerArabicName={verifiedReciter.arabic_name}
        readerStyle={verifiedReciter.style}
        readerPhoto={verifiedReciter.photo_url}
        readerBio={verifiedReciter.bio}
      />

      {/* Reciter Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 md:p-5 rounded-lg bg-midnight-850/80 border border-midnight-700/80">
        <div className="flex items-center space-x-3 w-full">
          <button
            type="button"
            onClick={handleSetAsActiveReciter}
            className="flex items-center space-x-2 px-2.5 md:px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm shadow-md shadow-indigo-950/40 transition-transform transform active:scale-95"
          >
            <BsFillPlayFill size={20} />
            <span>Play Full Quran</span>
          </button>

          {isCurrentReciter ? (
            <span className="text-xs font-semibold text-indigo-300 bg-midnight-800 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
              ✓ Active Reciter
            </span>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(setReciter(verifiedReciter))}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-midnight-750 hover:bg-midnight-700 transition-colors"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-3">
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
