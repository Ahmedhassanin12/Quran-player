const DB_NAME = 'quran_player_downloads';
const DB_VERSION = 2;
const METADATA_STORE = 'metadata';
const BLOBS_STORE = 'blobs';
const LEGACY_STORE = 'audio';

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

export const makeDownloadKey = (reciterId, surahId) => `${Number(reciterId)}:${Number(surahId)}`;

const mapError = (err) => {
  if (!err) return new Error('Downloads transaction failed');
  const name = err.name || '';
  if (name === 'QuotaExceededError' || err.code === 22) {
    return new Error('Device storage quota exceeded. Please free up space to download more Surahs.');
  }
  return err instanceof Error ? err : new Error(err.message || 'Downloads transaction failed');
};

const openDb = () => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const tx = request.transaction;

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const metaStore = db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        metaStore.createIndex('surahId', 'surahId', { unique: false });
        metaStore.createIndex('reciterId', 'reciterId', { unique: false });
        metaStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE, { keyPath: 'key' });
      }

      // Migrate from legacy single 'audio' store if upgrading from v1
      if (db.objectStoreNames.contains(LEGACY_STORE) && tx) {
        try {
          const oldStore = tx.objectStore(LEGACY_STORE);
          const metaStore = tx.objectStore(METADATA_STORE);
          const blobsStore = tx.objectStore(BLOBS_STORE);
          const cursorReq = oldStore.openCursor();
          cursorReq.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const record = cursor.value;
              if (record?.key) {
                const { blob, ...meta } = record;
                metaStore.put(meta);
                if (blob) {
                  blobsStore.put({ key: record.key, blob });
                }
              }
              cursor.continue();
            } else {
              try {
                db.deleteObjectStore(LEGACY_STORE);
              } catch (_) {
                // ignore legacy store deletion failure
              }
            }
          };
        } catch (_) {
          // ignore legacy migration failure
        }
      }
    };

    request.onblocked = () => {
      // eslint-disable-next-line no-console
      console.warn('IndexedDB upgrade blocked by an active tab. Please close other tabs.');
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      // Request persistent storage on supported browsers to prevent eviction
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(mapError(request.error || new Error('Failed to open downloads database')));
    };
  });

  return dbPromise;
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
    const db = await openDb();
    const key = record.key || makeDownloadKey(record.reciterId, record.surahId);

    const metadata = {
      key,
      surahId: Number(record.surahId),
      reciterId: Number(record.reciterId),
      reciterName: record.reciterName || '',
      surahName: record.surahName || '',
      arabicName: record.arabicName || '',
      sourceUrl: record.sourceUrl || '',
      sizeBytes: Number(record.sizeBytes) || (record.blob ? record.blob.size : 0),
      mimeType: record.mimeType || 'audio/mpeg',
      downloadedAt: record.downloadedAt || new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readwrite');
      const metaStore = tx.objectStore(METADATA_STORE);
      const blobsStore = tx.objectStore(BLOBS_STORE);

      metaStore.put(metadata);
      if (record.blob) {
        blobsStore.put({ key, blob: record.blob });
      }

      // CRITICAL (F-01 fix): Resolve ONLY when the transaction successfully commits to disk!
      tx.oncomplete = () => {
        resolve(toMetadata(metadata));
      };

      tx.onerror = () => {
        reject(mapError(tx.error));
      };

      tx.onabort = () => {
        reject(mapError(tx.error));
      };
    });
  },

  async getMetadata(reciterId, surahId) {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(METADATA_STORE, 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.get(key);

      request.onsuccess = () => resolve(toMetadata(request.result));
      request.onerror = () => reject(mapError(request.error));
      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  async get(reciterId, surahId) {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readonly');
      const metaStore = tx.objectStore(METADATA_STORE);
      const blobsStore = tx.objectStore(BLOBS_STORE);

      let meta = null;
      let blobEntry = null;

      metaStore.get(key).onsuccess = (e) => {
        meta = e.target.result;
      };

      blobsStore.get(key).onsuccess = (e) => {
        blobEntry = e.target.result;
      };

      tx.oncomplete = () => {
        if (!meta) {
          resolve(null);
          return;
        }
        resolve({
          ...meta,
          blob: blobEntry?.blob || null,
        });
      };

      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  async has(reciterId, surahId) {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(METADATA_STORE, 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.count(key);

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(mapError(request.error));
      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  // CRITICAL (F-03 fix): Queries METADATA_STORE only - 0 Blobs read into memory!
  async list() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(METADATA_STORE, 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result || [])
          .map(toMetadata)
          .filter(Boolean)
          .sort((a, b) => String(b.downloadedAt).localeCompare(String(a.downloadedAt)));
        resolve(records);
      };

      request.onerror = () => reject(mapError(request.error));
      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  async remove(reciterId, surahId) {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readwrite');
      tx.objectStore(METADATA_STORE).delete(key);
      tx.objectStore(BLOBS_STORE).delete(key);

      tx.oncomplete = () => resolve(key);
      tx.onerror = () => reject(mapError(tx.error));
      tx.onabort = () => reject(mapError(tx.error));
    });
  },

  async clearAll() {
    const db = await openDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readwrite');
      tx.objectStore(METADATA_STORE).clear();
      tx.objectStore(BLOBS_STORE).clear();

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(mapError(tx.error));
      tx.onabort = () => reject(mapError(tx.error));
    });
  },

  async getObjectUrl(reciterId, surahId) {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);

    return new Promise((resolve) => {
      const tx = db.transaction(BLOBS_STORE, 'readonly');
      const store = tx.objectStore(BLOBS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const { result } = request;
        if (!result?.blob) {
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(result.blob));
      };

      request.onerror = () => resolve(null);
      tx.onerror = () => resolve(null);
    });
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
