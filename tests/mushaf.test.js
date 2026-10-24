/**
 * Test Suite: Authentic Madinah Mushaf (Exact 604-Page Edition)
 * Verifies exact 604-page dataset, page-to-ayah mapping, boundary handling, image URL generation,
 * and reading persistence.
 */

import assert from 'node:assert/strict';
import {
  TOTAL_MUSHAF_PAGES,
  MUSHAF_PAGES,
  getPageForAyah,
  getMushafPageInfo,
  getMushafPageImageUrl,
} from '../src/assets/mushafMetadata.js';

console.log('--- RUNNING MADINAH MUSHAF TEST SUITE ---\n');

let passCount = 0;
let failCount = 0;

const test = (description, fn) => {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount += 1;
  } catch (err) {
    console.error(`[FAIL] ${description}:`, err.message);
    failCount += 1;
  }
};

// 1. Exact 604-Page Sequence Verification
test('Total Mushaf pages must be exactly 604', () => {
  assert.equal(TOTAL_MUSHAF_PAGES, 604);
  assert.equal(MUSHAF_PAGES.length, 604);
});

test('Page index starts at 1 and increments continuously up to 604', () => {
  for (let i = 0; i < 604; i += 1) {
    assert.equal(MUSHAF_PAGES[i].page, i + 1);
  }
});

// 2. Authoritative Page Boundary Mappings
test('Page 1 starts at 1:1 and ends at 1:7 (Surah Al-Fatihah frontispiece)', () => {
  const p1 = MUSHAF_PAGES[0];
  assert.equal(p1.page, 1);
  assert.equal(p1.startSurah, 1);
  assert.equal(p1.startAyah, 1);
  assert.equal(p1.endSurah, 1);
  assert.equal(p1.endAyah, 7);
  assert.equal(p1.juz, 1);
});

test('Page 2 starts at 2:1 and ends at 2:5 (Al-Baqarah frontispiece)', () => {
  const p2 = MUSHAF_PAGES[1];
  assert.equal(p2.page, 2);
  assert.equal(p2.startSurah, 2);
  assert.equal(p2.startAyah, 1);
  assert.equal(p2.endSurah, 2);
  assert.equal(p2.endAyah, 5);
  assert.equal(p2.juz, 1);
});

test('Page 3 starts at 2:6 and ends at 2:16 (First standard 15-line page)', () => {
  const p3 = MUSHAF_PAGES[2];
  assert.equal(p3.page, 3);
  assert.equal(p3.startSurah, 2);
  assert.equal(p3.startAyah, 6);
  assert.equal(p3.endSurah, 2);
  assert.equal(p3.endAyah, 16);
  assert.equal(p3.juz, 1);
});

test('Page 604 starts at 112:1 (Al-Ikhlas) and ends at 114:6 (An-Nas)', () => {
  const p604 = MUSHAF_PAGES[603];
  assert.equal(p604.page, 604);
  assert.equal(p604.startSurah, 112);
  assert.equal(p604.startAyah, 1);
  assert.equal(p604.endSurah, 114);
  assert.equal(p604.endAyah, 6);
  assert.equal(p604.juz, 30);
});

// 3. Jump to Ayah Resolution Across Representative Surahs
test('getPageForAyah resolves reference verses accurately', () => {
  const testCases = [
    { surah: 1, ayah: 1, expected: 1 },
    { surah: 1, ayah: 7, expected: 1 },
    { surah: 2, ayah: 1, expected: 2 },
    { surah: 2, ayah: 5, expected: 2 },
    { surah: 2, ayah: 6, expected: 3 },
    { surah: 2, ayah: 255, expected: 42 }, // Ayat Al-Kursi
    { surah: 3, ayah: 1, expected: 50 }, // Ali 'Imran start
    { surah: 18, ayah: 1, expected: 293 }, // Al-Kahf start
    { surah: 36, ayah: 1, expected: 440 }, // Ya-Sin start
    { surah: 55, ayah: 1, expected: 531 }, // Ar-Rahman start
    { surah: 67, ayah: 1, expected: 562 }, // Al-Mulk start
    { surah: 112, ayah: 1, expected: 604 }, // Al-Ikhlas start
    { surah: 113, ayah: 1, expected: 604 }, // Al-Falaq start
    { surah: 114, ayah: 6, expected: 604 }, // An-Nas final verse
  ];

  testCases.forEach(({ surah, ayah, expected }) => {
    const actual = getPageForAyah(surah, ayah);
    assert.equal(
      actual,
      expected,
      `Surah ${surah}:${ayah} resolved to page ${actual}, expected ${expected}`,
    );
  });
});

// 4. Boundary and Clamping Safety
test('Boundary handling clamps gracefully out-of-range inputs', () => {
  assert.equal(getMushafPageInfo(0).page, 1);
  assert.equal(getMushafPageInfo(-5).page, 1);
  assert.equal(getMushafPageInfo(700).page, 604);
  assert.equal(getMushafPageInfo('invalid').page, 1);
});

// 5. Official High-Resolution King Fahd Complex Page Image URL Format
test('getMushafPageImageUrl produces 3-digit padded official CDN URLs', () => {
  assert.equal(
    getMushafPageImageUrl(1),
    'https://android.quran.com/data/width_1260/page001.png',
  );
  assert.equal(
    getMushafPageImageUrl(42),
    'https://android.quran.com/data/width_1260/page042.png',
  );
  assert.equal(
    getMushafPageImageUrl(604),
    'https://android.quran.com/data/width_1260/page604.png',
  );
});

console.log(`\n--- TEST SUMMARY ---`);
console.log(`Total tests passed: ${passCount}`);
console.log(`Total tests failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
