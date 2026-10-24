import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const Searchbar = ({ value, onChange, placeholder = 'Search Surah by name, number, or Arabic title...' }) => (
  <div className="relative w-full">
    <div className="relative flex items-center">
      <FiSearch className="absolute left-3.5 w-4 h-4 text-indigo-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-midnight-850 hover:bg-midnight-800 text-sm text-slate-100 placeholder-slate-500 rounded-lg border border-midnight-700/80 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label="Clear search"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default Searchbar;
