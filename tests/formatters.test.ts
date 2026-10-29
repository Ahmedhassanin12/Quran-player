/**
 * Test Suite: Formatters
 * Verifies playback time, short time, Arabic digits, and byte formatting.
 */

import assert from 'node:assert/strict';
import {
  formatPlaybackTime,
  formatTimeShort,
  toArabicDigits,
  formatBytes,
} from '../src/utils/formatters';
import { getSurahId, getEffectiveReciterId } from '../src/utils/quranUtils';

console.log('--- RUNNING FORMATTERS TEST SUITE ---\n');

let passCount = 0;
let failCount = 0;

const test = (description: string, fn: () => void) => {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount += 1;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] ${description}:`, message);
    failCount += 1;
  }
};

// 1. formatPlaybackTime
test('formatPlaybackTime formats minutes and seconds without hours', () => {
  assert.equal(formatPlaybackTime(0), '0:00');
  assert.equal(formatPlaybackTime(45), '0:45');
  assert.equal(formatPlaybackTime(65), '1:05');
  assert.equal(formatPlaybackTime(600), '10:00');
});

test('formatPlaybackTime formats hours correctly when > 3600s', () => {
  assert.equal(formatPlaybackTime(3600), '1:00:00');
  assert.equal(formatPlaybackTime(3665), '1:01:05');
  assert.equal(formatPlaybackTime(7325), '2:02:05');
});

test('formatPlaybackTime handles boundary and invalid inputs gracefully', () => {
  assert.equal(formatPlaybackTime(null), '0:00');
  assert.equal(formatPlaybackTime(undefined), '0:00');
  assert.equal(formatPlaybackTime(NaN), '0:00');
  assert.equal(formatPlaybackTime(-10), '0:00');
});

// 2. formatTimeShort
test('formatTimeShort formats MM:SS with leading zeroes', () => {
  assert.equal(formatTimeShort(0), '0:00');
  assert.equal(formatTimeShort(9), '0:09');
  assert.equal(formatTimeShort(75), '1:15');
});

// 3. toArabicDigits
test('toArabicDigits translates Western digits into Eastern Arabic digits', () => {
  assert.equal(toArabicDigits(1), '١');
  assert.equal(toArabicDigits(114), '١١٤');
  assert.equal(toArabicDigits('255'), '٢٥٥');
  assert.equal(toArabicDigits(2024), '٢٠٢٤');
});

// 4. formatBytes
test('formatBytes formats bytes, KB, and MB accurately', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576), '1.0 MB');
  assert.equal(formatBytes(10485760), '10.0 MB');
});

// 5. Quran ID normalization accessors
test('getSurahId extracts chapter_id or id safely', () => {
  assert.equal(getSurahId({ id: 1 }), 1);
  assert.equal(getSurahId({ chapter_id: 2, id: 99 }), 2);
  assert.equal(getSurahId({ id: '114' }), 114);
  assert.equal(getSurahId(null), 0);
  assert.equal(getSurahId(undefined), 0);
});

test('getEffectiveReciterId prefers sura reciter_id then active reciter id', () => {
  assert.equal(getEffectiveReciterId({ reciter_id: 12 }, { id: 7 }), 12);
  assert.equal(getEffectiveReciterId(null, { id: 7 }), 7);
  assert.equal(getEffectiveReciterId({}, { id: '5' }), 5);
  assert.equal(getEffectiveReciterId(null, null), 0);
});

console.log(`\nFormatters Test Summary: ${passCount} Passed, ${failCount} Failed.\n`);
if (failCount > 0) {
  process.exit(1);
}
