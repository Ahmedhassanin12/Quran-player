import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ChapterInfoResponse } from '../../types';

export interface SuraInfoTabProps {
  infoData?: ChapterInfoResponse;
}

export const SuraInfoTab: React.FC<SuraInfoTabProps> = ({ infoData }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-midnight-850/60 border border-midnight-700/60 leading-relaxed text-slate-300 space-y-4">
      <h3 className="text-lg font-bold text-slate-100">
        {t('suraDetails.infoTab.title')}
      </h3>
      {infoData?.chapter_info?.short_text && (
        <p className="text-indigo-300/90 font-medium bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-lg" dir="auto">
          {infoData.chapter_info.short_text}
        </p>
      )}
      {infoData?.chapter_info?.text ? (
        <div
          dir="auto"
          className="prose prose-invert max-w-none text-slate-300 text-sm leading-7 space-y-3"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: infoData.chapter_info.text }}
        />
      ) : (
        <p className="text-sm text-slate-400">
          {t('suraDetails.infoTab.noCommentary')}
        </p>
      )}
    </div>
  );
};

export default React.memo(SuraInfoTab);
