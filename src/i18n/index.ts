import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  storageService,
  DEFAULT_LANGUAGE,
  type AppLanguage,
} from '../services/storageService';
import ar from './locales/ar';
import en from './locales/en';
import './types';

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
} as const;

export const normalizeLanguage = (lng?: string | null): AppLanguage => {
  if (lng && lng.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'ar';
};

export const getDirectionForLanguage = (lng: AppLanguage): 'rtl' | 'ltr' => (
  lng === 'ar' ? 'rtl' : 'ltr'
);

export const applyDocumentDirection = (lng: AppLanguage): void => {
  if (typeof document === 'undefined') return;
  const dir = getDirectionForLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
  document.title = lng === 'ar' ? ar.common.appTitle : en.common.appTitle;
};

const initialLanguage: AppLanguage = storageService.getLanguage() || DEFAULT_LANGUAGE;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: ['ar', 'en'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

applyDocumentDirection(initialLanguage);

i18n.on('languageChanged', (newLng: string) => {
  const normalized = normalizeLanguage(newLng);
  storageService.saveLanguage(normalized);
  applyDocumentDirection(normalized);
});

export const getCurrentLanguage = (): AppLanguage => (
  normalizeLanguage(i18n.resolvedLanguage || i18n.language)
);

export const changeAppLanguage = async (lng: AppLanguage): Promise<void> => {
  await i18n.changeLanguage(lng);
};

export default i18n;
