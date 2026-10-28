/**
 * Test Suite: Downloads Service and IndexedDB Engine
 * Verifies key formatting, audio blob validation, URL revoking, and metadata transformation.
 */

import assert from 'node:assert/strict';
import { downloadService, makeDownloadKey } from '../src/services/downloadService';

console.log('--- RUNNING DOWNLOADS SERVICE TEST SUITE ---\n');

let passCount = 0;
let failCount = 0;

const test = async (description: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    console.log(`[PASS] ${description}`);
    passCount += 1;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] ${description}:`, message);
    failCount += 1;
  }
};

const runSuite = async () => {
  // 1. Key Formatting
  await test('makeKey formats reciterId:surahId consistently', () => {
    assert.equal(downloadService.makeKey(7, 1), '7:1');
    assert.equal(downloadService.makeKey('7', '114'), '7:114');
    assert.equal(downloadService.makeKey(1, 114), '1:114');
    assert.equal(makeDownloadKey(12, 36), '12:36');
  });

  // 2. Fetch Audio Blob Validation
  await test('fetchAudioBlob rejects when sourceUrl is missing or empty', async () => {
    await assert.rejects(
      async () => downloadService.fetchAudioBlob(''),
      { message: 'Missing audio URL' },
    );
  });

  // 3. Object URL Revocation Safety
  await test('revokeObjectUrl handles null, undefined, and non-blob URLs without throwing', () => {
    assert.doesNotThrow(() => downloadService.revokeObjectUrl(null));
    assert.doesNotThrow(() => downloadService.revokeObjectUrl(undefined));
    assert.doesNotThrow(() => downloadService.revokeObjectUrl('https://example.com/audio.mp3'));
    assert.doesNotThrow(() => downloadService.revokeObjectUrl(''));
  });

  // 4. Verification of Service API Surface
  await test('downloadService exposes complete public API for offline audio engine', () => {
    const requiredMethods: (keyof typeof downloadService)[] = [
      'makeKey',
      'put',
      'getMetadata',
      'get',
      'has',
      'list',
      'remove',
      'clearAll',
      'getObjectUrl',
      'revokeObjectUrl',
      'fetchAudioBlob',
    ];

    requiredMethods.forEach((method) => {
      assert.equal(typeof downloadService[method], 'function', `Method ${method} should exist`);
    });
  });

  console.log(`\nDownloads Test Summary: ${passCount} Passed, ${failCount} Failed.\n`);
  if (failCount > 0) {
    process.exit(1);
  }
};

runSuite();
