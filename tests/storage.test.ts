/**
 * Test Suite: Storage Service
 * Verifies local storage persistence, fallbacks, favorites toggling,
 * recent recitation deduplication, and bookmark management.
 */

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
  const { storageService } = await import('../src/services/storageService');

  console.log('--- RUNNING STORAGE SERVICE TEST SUITE ---\n');

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

  // 1. View Mode Persistence
  test('View mode defaults to grid and saves preference', () => {
    mockLocalStorage.clear();
    assert.equal(storageService.getViewMode(), 'grid');
    storageService.saveViewMode('list');
    assert.equal(storageService.getViewMode(), 'list');
    storageService.saveViewMode('grid');
    assert.equal(storageService.getViewMode(), 'grid');
  });

  // 2. Favorites (Surah IDs)
  test('toggleFavorite adds and removes surah IDs correctly', () => {
    mockLocalStorage.clear();
    assert.deepEqual(storageService.getFavorites(), []);

    const updated1 = storageService.toggleFavorite(1);
    assert.deepEqual(updated1, [1]);
    assert.equal(storageService.getFavorites().includes(1), true);

    const updated2 = storageService.toggleFavorite(2);
    assert.deepEqual(updated2, [1, 2]);
    assert.equal(storageService.getFavorites().includes(2), true);

    const updated3 = storageService.toggleFavorite(1);
    assert.deepEqual(updated3, [2]);
    assert.equal(storageService.getFavorites().includes(1), false);
  });

  // 3. Favorite Reciters
  test('toggleFavoriteReciter adds and removes reciter IDs correctly', () => {
    mockLocalStorage.clear();
    assert.deepEqual(storageService.getFavoriteReciters(), []);

    const updated1 = storageService.toggleFavoriteReciter('7');
    assert.deepEqual(updated1, [7]);
    assert.equal(storageService.getFavoriteReciters().includes(7), true);

    const updated2 = storageService.toggleFavoriteReciter('7');
    assert.deepEqual(updated2, []);
    assert.equal(storageService.getFavoriteReciters().includes(7), false);
  });

  // 4. Recent Recitations (Deduplication & Order)
  test('addRecent inserts newest first and deduplicates by surahId', () => {
    mockLocalStorage.clear();
    const item1 = {
      surahId: 1,
      surahName: 'Al-Fatihah',
      arabicName: 'الفاتحة',
      reciterId: 7,
      reciterName: 'Mishari Rashid',
    };
    const item2 = {
      surahId: 2,
      surahName: 'Al-Baqarah',
      arabicName: 'البقرة',
      reciterId: 7,
      reciterName: 'Mishari Rashid',
    };

    storageService.addRecent(item1);
    storageService.addRecent(item2);

    let recents = storageService.getRecents();
    assert.equal(recents.length, 2);
    assert.equal(recents[0].surahId, 2);
    assert.equal(recents[1].surahId, 1);

    // Re-adding item 1 brings it back to index 0
    storageService.addRecent(item1);
    recents = storageService.getRecents();
    assert.equal(recents.length, 2);
    assert.equal(recents[0].surahId, 1);
  });

  // 5. User Settings
  test('saveSettings persists volume and speed with defaults fallback', () => {
    mockLocalStorage.clear();
    const initial = storageService.getSettings();
    assert.equal(initial.volume, 0.8);
    assert.equal(initial.speed, 1.0);

    storageService.saveSettings({ volume: 0.5, speed: 1.15 });
    const settings = storageService.getSettings();
    assert.equal(settings.volume, 0.5);
    assert.equal(settings.speed, 1.15);
  });

  // 6. Mushaf Page Persistence & Clamping
  test('saveLastMushafPage clamps to 1..604', () => {
    mockLocalStorage.clear();
    storageService.saveLastMushafPage(42);
    assert.equal(storageService.getLastMushafPage(), 42);

    storageService.saveLastMushafPage(999);
    assert.equal(storageService.getLastMushafPage(), 604);

    storageService.saveLastMushafPage(-5);
    assert.equal(storageService.getLastMushafPage(), 1);
  });

  // 7. Mushaf Bookmarks
  test('toggleMushafBookmark adds and removes bookmarks by verseKey', () => {
    mockLocalStorage.clear();
    const bookmark = {
      verseKey: '2:255',
      surahNumber: 2,
      ayahNumber: 255,
      surahName: 'Al-Baqarah',
      arabicName: 'البقرة',
      pageNumber: 42,
      createdAt: new Date().toISOString(),
    };

    const added = storageService.toggleMushafBookmark(bookmark);
    assert.equal(added.length, 1);
    assert.equal(storageService.isVerseBookmarked('2:255'), true);
    assert.equal(storageService.isVerseBookmarked('1:1'), false);

    const removed = storageService.toggleMushafBookmark({ verseKey: '2:255' });
    assert.equal(removed.length, 0);
    assert.equal(storageService.isVerseBookmarked('2:255'), false);
  });

  console.log(`\nStorage Service Test Summary: ${passCount} Passed, ${failCount} Failed.\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
