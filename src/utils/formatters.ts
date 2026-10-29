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
 * Formats byte values into human-readable string (B, KB, MB).
 */
export const formatBytes = (bytes: number | string | null | undefined): string => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
