const DB_NAME = 'quran_player_downloads';
const DB_VERSION = 1;
const STORE_NAME = 'audio';

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

export const makeDownloadKey = (reciterId, surahId) =>
  `${Number(reciterId)}:${Number(surahId)}`;

const openDb = () => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('surahId', 'surahId', { unique: false });
        store.createIndex('reciterId', 'reciterId', { unique: false });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open downloads database'));
    };
  });

  return dbPromise;
};

const runStoreRequest = async (mode, executor) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let settled = false;

    const finish = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    const fail = (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    };

    try {
      const request = executor(store);
      if (request && typeof request === 'object' && 'onsuccess' in request) {
        request.onsuccess = () => finish(request.result);
        request.onerror = () => fail(request.error);
      } else {
        tx.oncomplete = () => finish(request);
      }
    } catch (err) {
      fail(err);
      return;
    }

    tx.onerror = () => fail(tx.error || new Error('Downloads transaction failed'));
    tx.onabort = () => fail(tx.error || new Error('Downloads transaction aborted'));
  });
};

const toMetadata = (record) => {
  if (!record) return null;
  const {
    key,
    surahId,
    reciterId,
    reciterName,
    surahName,
    arabicName,
    sourceUrl,
    sizeBytes,
    mimeType,
    downloadedAt,
  } = record;
  return {
    key,
    surahId,
    reciterId,
    reciterName,
    surahName,
    arabicName,
    sourceUrl,
    sizeBytes,
    mimeType,
    downloadedAt,
  };
};

export const downloadService = {
  makeKey: makeDownloadKey,

  async put(record) {
    const key = record.key || makeDownloadKey(record.reciterId, record.surahId);
    const entry = {
      ...record,
      key,
      surahId: Number(record.surahId),
      reciterId: Number(record.reciterId),
      sizeBytes: Number(record.sizeBytes) || (record.blob ? record.blob.size : 0),
      downloadedAt: record.downloadedAt || new Date().toISOString(),
    };

    await runStoreRequest('readwrite', (store) => store.put(entry));
    return toMetadata(entry);
  },

  async get(reciterId, surahId) {
    const key = makeDownloadKey(reciterId, surahId);
    const result = await runStoreRequest('readonly', (store) => store.get(key));
    return result || null;
  },

  async has(reciterId, surahId) {
    const record = await this.get(reciterId, surahId);
    return Boolean(record?.blob);
  },

  async list() {
    const records = await runStoreRequest('readonly', (store) => store.getAll());
    return (records || [])
      .map(toMetadata)
      .filter(Boolean)
      .sort((a, b) => String(b.downloadedAt).localeCompare(String(a.downloadedAt)));
  },

  async remove(reciterId, surahId) {
    const key = makeDownloadKey(reciterId, surahId);
    await runStoreRequest('readwrite', (store) => store.delete(key));
    return key;
  },

  async getObjectUrl(reciterId, surahId) {
    const record = await this.get(reciterId, surahId);
    if (!record?.blob) return null;
    return URL.createObjectURL(record.blob);
  },

  revokeObjectUrl(url) {
    if (url && String(url).startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {
        // ignore revoke errors
      }
    }
  },

  async fetchAudioBlob(sourceUrl, { signal } = {}) {
    if (!sourceUrl) {
      throw new Error('Missing audio URL');
    }

    const response = await fetch(sourceUrl, {
      mode: 'cors',
      credentials: 'omit',
      signal,
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Downloaded audio file was empty');
    }

    return {
      blob,
      mimeType: blob.type || response.headers.get('content-type') || 'audio/mpeg',
      sizeBytes: blob.size,
    };
  },
};

export default downloadService;
