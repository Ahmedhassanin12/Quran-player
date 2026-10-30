/**
 * Shared formatting utilities for Quran Kareem application.
 */

/**
 * Formats time in seconds into playback display string (M:SS or H:MM:SS).
 */
export const formatPlaybackTime = (time: number | null | undefined): string => {
  if (time === null || time === undefined || Number.isNaN(time) || !Number.isFinite(time) || time < 0) {
    return '0:00';
  }
  const totalSeconds = Math.floor(time);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats time in seconds into concise MM:SS string (e.g. for banners and compact cards).
 */
export const formatTimeShort = (seconds = 0): string => {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Converts Western digits (0-9) to Eastern Arabic numerals (٠-٩).
 */
export const toArabicDigits = (num: number | string): string =>
  String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

/**
 * Formats numbers using Intl.NumberFormat for the active UI language ('ar' | 'en').
 */
export const formatNumber = (
  value: number | string | null | undefined,
  language: 'ar' | 'en' | string = 'en',
): string => {
  const num = Number(value);
  if (value === null || value === undefined || Number.isNaN(num) || !Number.isFinite(num)) {
    return '0';
  }
  const isArabic = String(language).toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Formats dates using Intl.DateTimeFormat for the active UI language ('ar' | 'en').
 */
export const formatDate = (
  dateInput: string | number | Date | null | undefined,
  language: 'ar' | 'en' | string = 'en',
): string => {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const isArabic = String(language).toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats byte values into human-readable string (B, KB, MB) with optional locale support.
 */
export const formatBytes = (
  bytes: number | string | null | undefined,
  language?: 'ar' | 'en' | string,
): string => {
  const size = Number(bytes) || 0;
  const isArabic = Boolean(language && String(language).toLowerCase().startsWith('ar'));

  if (!isArabic) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  const fmt = new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: size < 1024 ? 0 : 1,
    maximumFractionDigits: size < 1024 ? 0 : 1,
  });

  if (size < 1024) return `${fmt.format(size)} بايت`;
  if (size < 1024 * 1024) return `${fmt.format(size / 1024)} ك.ب`;
  return `${fmt.format(size / (1024 * 1024))} م.ب`;
};
