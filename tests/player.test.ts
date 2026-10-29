/**
 * Test Suite: Player Redux Slice
 * Verifies playerSlice state transitions, reducers, repeat/shuffle logic,
 * speed clamping, seek counters, sleep timer countdown, and Hifz looper.
 */

import assert from 'node:assert/strict';

// Mock in-memory localStorage for Node test runner before importing slice
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
    default: playerReducer,
    playPause,
    togglePlayPause,
    cycleRepeatMode,
    toggleShuffle,
    setVolume,
    setPlaybackSpeed,
    setSeekTime,
    setSleepTimer,
    decrementSleepTimer,
    clearSleepTimer,
    setHifzMode,
    incrementHifzLoop,
    toggleFavoriteSurah,
    toggleFavoriteReciter,
    selectIsFavoriteSurah,
    selectIsFavoriteReciter,
  } = await import('../src/redux/features/playerSlice');

  console.log('--- RUNNING PLAYER SLICE TEST SUITE ---\n');

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

  const getInitialState = () => playerReducer(undefined, { type: '@@INIT' });

  // 1. Play / Pause
  test('playPause sets isPlaying explicitly', () => {
    const state = getInitialState();
    assert.equal(state.isPlaying, false);

    const playing = playerReducer(state, playPause(true));
    assert.equal(playing.isPlaying, true);

    const paused = playerReducer(playing, playPause(false));
    assert.equal(paused.isPlaying, false);
  });

  test('togglePlayPause flips playback boolean', () => {
    const state = getInitialState();
    const toggled1 = playerReducer(state, togglePlayPause());
    assert.equal(toggled1.isPlaying, true);

    const toggled2 = playerReducer(toggled1, togglePlayPause());
    assert.equal(toggled2.isPlaying, false);
  });

  // 2. Repeat Mode
  test('cycleRepeatMode cycles off -> all -> one -> off', () => {
    let state = getInitialState();
    assert.equal(state.repeatMode, 'off');

    state = playerReducer(state, cycleRepeatMode());
    assert.equal(state.repeatMode, 'all');

    state = playerReducer(state, cycleRepeatMode());
    assert.equal(state.repeatMode, 'one');

    state = playerReducer(state, cycleRepeatMode());
    assert.equal(state.repeatMode, 'off');
  });

  // 3. Shuffle
  test('toggleShuffle toggles shuffle flag', () => {
    let state = getInitialState();
    assert.equal(state.shuffle, false);

    state = playerReducer(state, toggleShuffle());
    assert.equal(state.shuffle, true);

    state = playerReducer(state, toggleShuffle());
    assert.equal(state.shuffle, false);
  });

  // 4. Volume & Playback Speed
  test('setVolume updates volume state', () => {
    const state = getInitialState();
    const updated = playerReducer(state, setVolume(0.5));
    assert.equal(updated.volume, 0.5);
  });

  test('setPlaybackSpeed accepts values between 0.75 and 1.25', () => {
    const state = getInitialState();

    const valid1 = playerReducer(state, setPlaybackSpeed(0.75));
    assert.equal(valid1.playbackSpeed, 0.75);

    const valid2 = playerReducer(state, setPlaybackSpeed(1.25));
    assert.equal(valid2.playbackSpeed, 1.25);

    const invalidHigh = playerReducer(valid1, setPlaybackSpeed(1.5));
    assert.equal(invalidHigh.playbackSpeed, 0.75); // unchanged

    const invalidLow = playerReducer(valid1, setPlaybackSpeed(0.5));
    assert.equal(invalidLow.playbackSpeed, 0.75); // unchanged
  });

  // 5. Seek Time & Counter
  test('setSeekTime updates seekTime and increments seekCount', () => {
    const state = getInitialState();
    const initialCount = state.seekCount;

    const seeked1 = playerReducer(state, setSeekTime(42));
    assert.equal(seeked1.seekTime, 42);
    assert.equal(seeked1.seekCount, initialCount + 1);

    const seeked2 = playerReducer(seeked1, setSeekTime(100));
    assert.equal(seeked2.seekTime, 100);
    assert.equal(seeked2.seekCount, initialCount + 2);
  });

  // 6. Sleep Timer Countdown & Auto-Stop
  test('decrementSleepTimer decrements remainingSeconds and manages fadeout/stop', () => {
    let state = getInitialState();
    state = playerReducer(state, playPause(true));
    state = playerReducer(state, setSleepTimer({ mode: '15', minutes: 1 }));

    assert.equal(state.sleepTimer.active, true);
    assert.equal(state.sleepTimer.remainingSeconds, 60);
    assert.equal(state.sleepTimer.isFadingOut, false);

    // Decrement down to 31
    for (let i = 0; i < 29; i += 1) {
      state = playerReducer(state, decrementSleepTimer());
    }
    assert.equal(state.sleepTimer.remainingSeconds, 31);
    assert.equal(state.sleepTimer.isFadingOut, false);

    // Decrement to 30 -> fade out starts
    state = playerReducer(state, decrementSleepTimer());
    assert.equal(state.sleepTimer.remainingSeconds, 30);
    assert.equal(state.sleepTimer.isFadingOut, true);

    // Decrement remaining 30 seconds -> shuts off and pauses
    for (let i = 0; i < 30; i += 1) {
      state = playerReducer(state, decrementSleepTimer());
    }
    assert.equal(state.sleepTimer.active, false);
    assert.equal(state.sleepTimer.remainingSeconds, 0);
    assert.equal(state.isPlaying, false);
  });

  test('clearSleepTimer resets sleep timer without pausing immediately', () => {
    let state = getInitialState();
    state = playerReducer(state, playPause(true));
    state = playerReducer(state, setSleepTimer({ mode: '15', minutes: 15 }));

    state = playerReducer(state, clearSleepTimer());
    assert.equal(state.sleepTimer.active, false);
    assert.equal(state.isPlaying, true);
  });

  // 7. Hifz Mode Looping
  test('incrementHifzLoop steps until targetLoops reached', () => {
    let state = getInitialState();
    state = playerReducer(state, setHifzMode({
      active: true,
      startVerse: 1,
      endVerse: 5,
      targetLoops: 3,
      currentLoop: 1,
    }));

    assert.equal(state.hifzMode.active, true);
    assert.equal(state.hifzMode.currentLoop, 1);

    // Loop 1 -> Loop 2
    state = playerReducer(state, incrementHifzLoop());
    assert.equal(state.hifzMode.active, true);
    assert.equal(state.hifzMode.currentLoop, 2);

    // Loop 2 -> Loop 3
    state = playerReducer(state, incrementHifzLoop());
    assert.equal(state.hifzMode.active, true);
    assert.equal(state.hifzMode.currentLoop, 3);

    // Loop 3 (target) -> deactivates Hifz mode
    state = playerReducer(state, incrementHifzLoop());
    assert.equal(state.hifzMode.active, false);
  });

  // 8. Pure Favorites Toggling
  test('toggleFavoriteSurah updates favorites immutably', () => {
    let state = getInitialState();
    state = { ...state, favorites: [] };

    state = playerReducer(state, toggleFavoriteSurah(1));
    assert.deepEqual(state.favorites, [1]);
    assert.equal(selectIsFavoriteSurah(1)({ player: state }), true);

    state = playerReducer(state, toggleFavoriteSurah(2));
    assert.deepEqual(state.favorites, [1, 2]);

    state = playerReducer(state, toggleFavoriteSurah(1));
    assert.deepEqual(state.favorites, [2]);
    assert.equal(selectIsFavoriteSurah(1)({ player: state }), false);
  });

  // 9. Pure Favorite Reciters Toggling
  test('toggleFavoriteReciter updates favorite reciters immutably', () => {
    let state = getInitialState();
    state = { ...state, favoriteReciters: [] };

    state = playerReducer(state, toggleFavoriteReciter(7));
    assert.deepEqual(state.favoriteReciters, [7]);
    assert.equal(selectIsFavoriteReciter(7)({ player: state }), true);

    state = playerReducer(state, toggleFavoriteReciter(7));
    assert.deepEqual(state.favoriteReciters, []);
    assert.equal(selectIsFavoriteReciter(7)({ player: state }), false);
  });

  console.log(`\nPlayer Slice Tests Completed: ${passCount} Passed, ${failCount} Failed.\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
