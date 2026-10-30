import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtistCard, Searchbar } from '../components';
import { VERIFIED_RECITERS } from '../assets/recitersData';
import type { VerifiedReciter } from '../types';

type StyleFilter = 'all' | 'Murattal' | 'Mujawwad' | 'Muallim';

const TopReaders: React.FC = () => {
  const { t } = useTranslation();
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
        (r) => r.reciter_name.toLowerCase().includes(q)
          || (r.arabic_name && r.arabic_name.includes(q))
          || (r.country && r.country.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [searchQuery, selectedStyle]);

  return (
    <div className="flex flex-col space-y-3.5">
      {/* Editorial Header */}
      <div className="pt-1 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-midnight-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>{t('reciters.verifiedRoster')}</span>
            <span className="text-slate-600">·</span>
            <span>{t('reciters.globalMasters')}</span>
            <span className="text-slate-600">·</span>
            <span>{t('reciters.riwayah')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight flex items-baseline gap-3">
            <span>{t('reciters.heroTitle')}</span>
          </h1>
        </div>
      </div>

      {/* Search & Style Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="w-full sm:w-80 shrink-0">
          <Searchbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('reciters.searchPlaceholder')}
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
            {t('reciters.styles.All')}
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
            {t('reciters.styles.Murattal')}
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
            {t('reciters.styles.Mujawwad')}
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
            {t('reciters.styles.Muallim')}
          </button>
        </div>
      </div>

      {/* Reciters Grid */}
      {filteredReciters.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-midnight-850 border border-midnight-700/60">
          <p className="text-base text-slate-300 font-semibold">
            {t('reciters.emptyTitle')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t('reciters.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-3">
          {filteredReciters.map((reader) => (
            <ArtistCard key={`${reader.id}-${reader.style}`} reader={reader} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopReaders;
