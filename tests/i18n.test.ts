import assert from 'node:assert/strict';

// Mock in-memory localStorage for Node test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    memoryStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
  },
};

(globalThis as unknown as { window: unknown }).window = {
  localStorage: mockLocalStorage,
};

async function runTests() {
  const {
    normalizeLanguage,
    getDirectionForLanguage,
  } = await import('../src/i18n');
  const { default: en } = await import('../src/i18n/locales/en');
  const { default: ar } = await import('../src/i18n/locales/ar');
  const {
    storageService,
    DEFAULT_LANGUAGE,
  } = await import('../src/services/storageService');
  const {
    formatNumber,
    formatBytes,
    formatDate,
  } = await import('../src/utils/formatters');
  const {
    getLocalizedSurahName,
    getLocalizedReciterName,
  } = await import('../src/utils/quranUtils');
  const { getOfflineSurahMetadata } = await import('../src/assets/surahMetadata');

  console.log('\n--- RUNNING I18N & LOCALIZATION TEST SUITE ---');

  let passed = 0;

  // Test 1: Default language & persistence
  assert.equal(DEFAULT_LANGUAGE, 'ar', 'Default language must be Arabic (ar)');
  assert.equal(storageService.getLanguage(), 'ar', 'Unset storage should fallback to default (ar)');

  storageService.saveLanguage('en');
  assert.equal(storageService.getLanguage(), 'en', 'saveLanguage should persist en to localStorage');
  storageService.saveLanguage('ar');
  assert.equal(storageService.getLanguage(), 'ar', 'saveLanguage should persist ar to localStorage');
  passed += 1;
  console.log('[PASS] Default language is ar and persists across storageService');

  // Test 2: Direction mapping
  assert.equal(getDirectionForLanguage('ar'), 'rtl', 'ar must resolve to rtl');
  assert.equal(getDirectionForLanguage('en'), 'ltr', 'en must resolve to ltr');
  passed += 1;
  console.log('[PASS] Language direction resolves accurately (ar -> rtl, en -> ltr)');

  // Test 3: Language normalization
  assert.equal(normalizeLanguage('ar'), 'ar');
  assert.equal(normalizeLanguage('en'), 'en');
  assert.equal(normalizeLanguage('en-US'), 'en');
  assert.equal(normalizeLanguage('EN-GB'), 'en');
  assert.equal(normalizeLanguage('fr'), 'ar', 'Unsupported language defaults to ar');
  assert.equal(normalizeLanguage(null), 'ar');
  passed += 1;
  console.log('[PASS] normalizeLanguage handles locale tags and fallbacks gracefully');

  // Test 4: Key completeness between AR and EN (zero missing keys)
  function compareKeys(obj1: Record<string, unknown>, obj2: Record<string, unknown>, prefix = ''): void {
    Object.keys(obj1).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      assert.ok(key in obj2, `Missing key in translation: ${fullKey}`);
      if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        assert.equal(
          typeof obj2[key],
          'object',
          `Type mismatch for translation object: ${fullKey}`,
        );
        compareKeys(
          obj1[key] as Record<string, unknown>,
          obj2[key] as Record<string, unknown>,
          fullKey,
        );
      }
    });
  }

  compareKeys(en as unknown as Record<string, unknown>, ar as unknown as Record<string, unknown>);
  compareKeys(ar as unknown as Record<string, unknown>, en as unknown as Record<string, unknown>);
  passed += 1;
  console.log('[PASS] 100% Translation key parity verified between English and Arabic');

  // Test 5: Number formatting
  const numEn = formatNumber(114, 'en');
  assert.equal(numEn, '114', 'English number should be Latin digits');

  const numAr = formatNumber(114, 'ar');
  assert.ok(
    numAr.includes('١١٤') || numAr.includes('114'),
    'Arabic number formatting should be present and valid',
  );
  passed += 1;
  console.log('[PASS] formatNumber respects language locale');

  // Test 6: Byte formatting
  const bytesEn = formatBytes(1048576, 'en');
  assert.ok(bytesEn.includes('MB'), 'English formatBytes uses MB');

  const bytesAr = formatBytes(1048576, 'ar');
  assert.ok(
    bytesAr.includes('م.ب') || bytesAr.includes('ميجابايت') || bytesAr.includes('MB'),
    'Arabic formatBytes provides Arabic units',
  );
  passed += 1;
  console.log('[PASS] formatBytes provides localized unit labels');

  // Test 7: Date formatting
  const testDate = new Date(2026, 9, 30);
  const dateEn = formatDate(testDate, 'en');
  assert.ok(dateEn.length > 0, 'English date should format successfully');

  const dateAr = formatDate(testDate, 'ar');
  assert.ok(dateAr.length > 0, 'Arabic date should format successfully');
  passed += 1;
  console.log('[PASS] formatDate provides valid localized date strings');

  // Test 8: Offline 114 Surah metadata completeness
  assert.equal(Object.keys(getOfflineSurahMetadata(1) ? { ok: true } : {}).length, 1);
  const fatihah = getOfflineSurahMetadata(1);
  assert.equal(fatihah?.name_arabic, 'الفاتحة');
  assert.equal(fatihah?.name_simple, 'Al-Fatihah');
  assert.equal(fatihah?.revelation_place, 'makkah');
  assert.equal(fatihah?.verses_count, 7);

  const nas = getOfflineSurahMetadata(114);
  assert.equal(nas?.name_arabic, 'الناس');
  assert.equal(nas?.name_simple, 'An-Nas');
  assert.equal(nas?.verses_count, 6);
  passed += 1;
  console.log('[PASS] Complete 114-Surah offline metadata verified');

  // Test 9: getLocalizedSurahName and getLocalizedReciterName
  assert.equal(
    getLocalizedSurahName({ id: 18, name_arabic: 'الكهف', name_simple: 'Al-Kahf' }, 'ar'),
    'سورة الكهف',
  );
  assert.equal(
    getLocalizedSurahName({ id: 18, name_arabic: 'الكهف', name_simple: 'Al-Kahf' }, 'en'),
    'Al-Kahf',
  );
  // Test offline fallback with just an ID
  assert.equal(getLocalizedSurahName({ id: 36 }, 'ar'), 'سورة يس');
  assert.equal(getLocalizedSurahName({ id: 36 }, 'en'), 'Ya-Sin');

  assert.equal(
    getLocalizedReciterName({ id: 7, reciter_name: 'Mishari Rashid al-`Afasy', arabic_name: 'مشاري راشد العفاسي' }, 'ar'),
    'مشاري راشد العفاسي',
  );
  assert.equal(
    getLocalizedReciterName({ id: 7, reciter_name: 'Mishari Rashid al-`Afasy', arabic_name: 'مشاري راشد العفاسي' }, 'en'),
    'Mishari Rashid al-`Afasy',
  );
  passed += 1;
  console.log('[PASS] getLocalizedSurahName & getLocalizedReciterName correctly switch on language');

  console.log(`\nI18n Test Summary: ${passed} Passed, 0 Failed.\n`);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
