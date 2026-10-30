import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { changeAppLanguage, normalizeLanguage } from '../i18n';
import type { AppLanguage } from '../services/storageService';

export interface LanguageSwitcherProps {
  variant?: 'sidebar' | 'compact';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'sidebar',
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const currentLang: AppLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const handleSelectLanguage = (lang: AppLanguage) => {
    if (lang !== currentLang) {
      changeAppLanguage(lang);
    }
  };

  if (variant === 'compact') {
    const nextLang: AppLanguage = currentLang === 'ar' ? 'en' : 'ar';
    return (
      <button
        type="button"
        onClick={() => handleSelectLanguage(nextLang)}
        aria-label={t('nav.switchLanguage')}
        title={t('nav.switchLanguage')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-midnight-850/90 border border-midnight-700/80 text-xs font-semibold text-slate-200 hover:text-white hover:border-indigo-500/40 shadow-lg backdrop-blur transition-colors ${className}`}
      >
        <FiGlobe size={14} className="text-indigo-400 shrink-0" />
        <span>{currentLang === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('nav.switchLanguage')}
      className={`flex items-center justify-between gap-2 p-1.5 rounded-lg bg-midnight-850 border border-midnight-700/60 ${className}`}
    >
      <div className="flex items-center gap-1.5 ps-2 text-slate-400">
        <FiGlobe size={13} className="text-indigo-400 shrink-0" />
        <span className="text-[11px] font-medium">{t('common.language')}</span>
      </div>
      <div className="inline-flex items-center rounded-md bg-midnight-900 p-0.5 border border-midnight-700/60">
        <button
          type="button"
          onClick={() => handleSelectLanguage('ar')}
          aria-pressed={currentLang === 'ar'}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            currentLang === 'ar'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('common.arabic')}
        </button>
        <button
          type="button"
          onClick={() => handleSelectLanguage('en')}
          aria-pressed={currentLang === 'en'}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
            currentLang === 'en'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('common.english')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
