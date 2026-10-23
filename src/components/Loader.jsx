import React from 'react';
import { RubElHizbIcon } from './IslamicArtwork';

const Loader = ({ title = 'Loading Quran...' }) => (
  <div className="w-full min-h-[300px] flex flex-col justify-center items-center py-12 select-none">
    <div className="relative flex items-center justify-center">
      <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
      <div className="absolute">
        <RubElHizbIcon className="w-7 h-7 text-indigo-300 animate-pulse" />
      </div>
    </div>
    <h3 className="font-medium text-base text-slate-200 mt-5 tracking-wide">
      {title}
    </h3>
    <p className="font-arabic text-sm text-indigo-400/80 mt-1">
      جاري تحميل بيانات القرآن الكريم
    </p>
  </div>
);

export default Loader;
