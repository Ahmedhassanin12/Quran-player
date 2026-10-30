import 'i18next';
import type { TranslationSchema } from './locales/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}

export type { TranslationSchema };
