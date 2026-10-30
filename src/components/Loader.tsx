import React from 'react';
import { useTranslation } from 'react-i18next';
import { RubElHizbIcon } from './IslamicArtwork';

export interface LoaderProps {
  title?: string;
}

const Loader: React.FC<LoaderProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-[300px] flex flex-col justify-center items-center py-12 select-none">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        <div className="absolute">
          <RubElHizbIcon className="w-7 h-7 text-indigo-300 animate-pulse" />
        </div>
      </div>
      <h3 className="font-medium text-base text-slate-200 mt-5 tracking-wide">
        {title || t('common.loading')}
      </h3>
    </div>
  );
};

export default Loader;
