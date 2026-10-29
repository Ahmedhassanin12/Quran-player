/**
 * Quran domain model normalization helpers
 * Ensures consistent extraction of Surah and Reciter identifiers across disparate API responses.
 */

export interface SurahIdentifiable {
  id?: number | string;
  chapter_id?: number | string;
}

export interface ReciterIdentifiable {
  id?: number | string;
  reciter_id?: number | string;
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
