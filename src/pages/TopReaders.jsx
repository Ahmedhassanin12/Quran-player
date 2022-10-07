import { useEffect } from 'react';
import axios from 'axios';

import { ArtistCard, Error, Loader, SurahCard } from '../components';
import { useGetAllRecitationsQuery } from '../redux/services/quranCore';

const TopReaders = () => {
  const { data, isFetching, error } = useGetAllRecitationsQuery();

  if (isFetching) {
    return <Loader title="loading songs" />;
  }

  if (error) return <Error />;

  return (
    <div className="flex flex-col">
      <h2 className="font-bold text-white text-3xl mt-4 mb-4">Top Reciters</h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {data?.recitations?.map((reader, i) => (
          <ArtistCard key={reader.id} reader={reader} />
        ))}
      </div>
    </div>
  );
};

export default TopReaders;
