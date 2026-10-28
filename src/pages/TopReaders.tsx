import React, { useState, useMemo } from 'react';
import { ArtistCard, Searchbar } from '../components';
import { VERIFIED_RECITERS } from '../assets/recitersData';
import type { VerifiedReciter } from '../types';

type StyleFilter = 'all' | 'Murattal' | 'Mujawwad' | 'Muallim';

const TopReaders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<StyleFilter>('all');

  const filteredReciters = useMemo<VerifiedReciter[]>(() => {
    let list: VerifiedReciter[] = VERIFIED_RECITERS;

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
    <div className="flex flex-col space-y-3.5">
      {/* Editorial Header */}
      <div className="pt-1 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-midnight-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Verified Qari Roster</span>
            <span className="text-slate-600">·</span>
            <span>12 Global Masters</span>
            <span className="text-slate-600">·</span>
            <span>رواية حفص عن عاصم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-baseline gap-3">
            <span>Quran Reciters</span>
            <span className="font-arabic font-normal text-xl sm:text-2xl text-slate-400">
              قراء القرآن الكريم
            </span>
          </h1>
        </div>
      </div>

      {/* Search & Style Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="w-full sm:w-80 shrink-0">
          <Searchbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reciter by English or Arabic name..."
          />
        </div>

        {/* Style Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-midnight-850/80 border border-midnight-700/60 text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedStyle('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedStyle === 'all'
                ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Styles
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Murattal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedStyle === 'Murattal'
                ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Murattal (مرتل)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Mujawwad')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedStyle === 'Mujawwad'
                ? 'bg-midnight-750 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mujawwad (مجود)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStyle('Muallim')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedStyle === 'Muallim'
                ? 'bg-midnight-750 text-white font-semibold shadow-sm'
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
