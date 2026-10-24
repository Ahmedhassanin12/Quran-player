import React, { useState, useMemo } from 'react';
import { ArtistCard, Searchbar } from '../components';
import { VERIFIED_RECITERS } from '../assets/recitersData';

const TopReaders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all'); // 'all' | 'Murattal' | 'Mujawwad' | 'Muallim'

  const filteredReciters = useMemo(() => {
    let list = VERIFIED_RECITERS;

    if (selectedStyle !== 'all') {
      list = list.filter(
        (r) => (r.style || 'Murattal').toLowerCase() === selectedStyle.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.reciter_name.toLowerCase().includes(q) ||
          (r.arabic_name && r.arabic_name.includes(q)) ||
          (r.country && r.country.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [searchQuery, selectedStyle]);

  return (
    <div className="flex flex-col space-y-2">
      {/* Header Banner */}
      <div className="relative rounded-xl p-4 sm:p-5 bg-midnight-850/60 border border-midnight-700/60 shadow-sm overflow-hidden">
        <div className="relative z-10 pr-10 md:pr-0">
          <div className="flex items-center space-x-2 text-indigo-400/90 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Verified Qari Roster</span>
            <span className="text-slate-600">•</span>
            <span>12 Global Masters</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Quran Reciters (القراء)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-arabic mt-1">
            نخبة من كبار قراء العالم الإسلامي برواية حفص عن عاصم بمختلف المقامات
          </p>
        </div>
      </div>

      {/* Search & Style Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Searchbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search reciter by English or Arabic name..."
        />

        {/* Style Tabs */}
        <div className="w-full flex  p-1 rounded-lg bg-midnight-850 border border-midnight-700/80 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStyle('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedStyle === 'all'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Styles
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Murattal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedStyle === 'Murattal'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Murattal (مرتل)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Mujawwad')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedStyle === 'Mujawwad'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mujawwad (مجود)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Muallim')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedStyle === 'Muallim'
                ? 'bg-indigo-500 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Muallim (معلم)
          </button>
        </div>
      </div>

      {/* Reciters Grid */}
      {filteredReciters.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-midnight-850 border border-midnight-700/60">
          <p className="text-base text-slate-300 font-semibold">
            No reciters found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try searching with a different name or changing the style filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-3">
          {filteredReciters.map((reader) => (
            <ArtistCard key={reader.id} reader={reader} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopReaders;
