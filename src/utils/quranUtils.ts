/**
 * Quran domain model normalization & localization helpers
 * Ensures consistent extraction of Surah and Reciter identifiers and localized names
 * across disparate API responses and offline storage.
 */
import { getOfflineSurahMetadata } from '../assets/surahMetadata';
import { getReciterById } from '../assets/recitersData';
import type { AppLanguage } from '../services/storageService';

export interface SurahIdentifiable {
  id?: number | string;
  chapter_id?: number | string;
  name_simple?: string;
  name_arabic?: string;
  surahName?: string;
}

export interface ReciterIdentifiable {
  id?: number | string;
  reciter_id?: number | string;
  reciter_name?: string;
  arabic_name?: string;
  reciterName?: string;
}

/**
 * Extracts a normalized numeric Surah ID (1..114).
 */
export function getSurahId(item: SurahIdentifiable | null | undefined): number {
  if (!item) return 0;
  return Number(item.chapter_id || item.id || 0);
}

/**
 * Extracts a normalized numeric Reciter ID, checking surah-specific override first then active reciter.
 */
export function getEffectiveReciterId(
  sura: ReciterIdentifiable | null | undefined,
  currentReciter: ReciterIdentifiable | null | undefined,
): number {
  return Number(sura?.reciter_id || currentReciter?.id || 0);
}

/**
 * Returns the localized Surah name according to the active UI language ('ar' or 'en'),
 * falling back to offline 114-Surah metadata when API fields are missing.
 */
export function getLocalizedSurahName(
  sura: SurahIdentifiable | null | undefined,
  language: AppLanguage = 'ar',
): string {
  if (!sura) return '';
  const id = getSurahId(sura);
  const offlineMeta = id ? getOfflineSurahMetadata(id) : undefined;

  if (language === 'ar') {
    if (sura.name_arabic) return `سورة ${sura.name_arabic.replace(/^سورة\s+/u, '')}`;
    if (offlineMeta?.name_arabic) return `سورة ${offlineMeta.name_arabic}`;
    return sura.name_simple || sura.surahName || (id ? `سورة ${id}` : '');
  }

  return (
    sura.name_simple
    || offlineMeta?.name_simple
    || sura.surahName
    || sura.name_arabic
    || (id ? `Surah ${id}` : '')
  );
}

/**
 * Returns the localized Reciter name according to the active UI language ('ar' or 'en'),
 * falling back to verified reciter metadata when needed.
 */
export function getLocalizedReciterName(
  reciter: ReciterIdentifiable | null | undefined,
  language: AppLanguage = 'ar',
): string {
  if (!reciter) return '';
  const id = Number(reciter.reciter_id || reciter.id || 0);
  const verified = id ? getReciterById(id) : undefined;

  if (language === 'ar') {
    return (
      reciter.arabic_name
      || verified?.arabic_name
      || reciter.reciter_name
      || reciter.reciterName
      || ''
    );
  }

  return (
    reciter.reciter_name
    || verified?.reciter_name
    || reciter.reciterName
    || reciter.arabic_name
    || ''
  );
}
