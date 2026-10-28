import type {
  DownloadedSurahMetadata,
  DownloadedAudioRecord,
} from '../types/downloads';

const DB_NAME = 'quran_player_downloads';
const DB_VERSION = 2;
const METADATA_STORE = 'metadata';
const BLOBS_STORE = 'blobs';
const LEGACY_STORE = 'audio';

let dbPromise: Promise<IDBDatabase> | null = null;

export const makeDownloadKey = (reciterId: number | string, surahId: number | string): string =>
  `${Number(reciterId)}:${Number(surahId)}`;

const mapError = (err: unknown): Error => {
  if (!err) return new Error('Downloads transaction failed');
  const errorObj = err as { name?: string; code?: number; message?: string };
  const name = errorObj.name || '';
  if (name === 'QuotaExceededError' || errorObj.code === 22) {
    return new Error('Device storage quota exceeded. Please free up space to download more Surahs.');
  }
  return err instanceof Error ? err : new Error(errorObj.message || 'Downloads transaction failed');
};

const openDb = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
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
            const target = e.target as IDBRequest<IDBCursorWithValue | null>;
            const cursor = target?.result;
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

export interface PutDownloadRecord {
  key?: string;
  surahId: number | string;
  reciterId: number | string;
  reciterName?: string;
  surahName?: string;
  arabicName?: string;
  sourceUrl?: string;
  sizeBytes?: number;
  mimeType?: string;
  downloadedAt?: string;
  blob?: Blob;
}

const toMetadata = (record: Partial<DownloadedSurahMetadata> | null | undefined): DownloadedSurahMetadata | null => {
  if (!record || !record.key) return null;
  const {
    key,
    surahId = 0,
    reciterId = 0,
    reciterName = '',
    surahName = '',
    arabicName = '',
    sourceUrl = '',
    sizeBytes = 0,
    mimeType = 'audio/mpeg',
    downloadedAt = new Date().toISOString(),
  } = record;
  return {
    key,
    surahId: Number(surahId),
    reciterId: Number(reciterId),
    reciterName,
    surahName,
    arabicName,
    sourceUrl,
    sizeBytes: Number(sizeBytes) || 0,
    mimeType,
    downloadedAt,
  };
};

export const downloadService = {
  makeKey: makeDownloadKey,

  async put(record: PutDownloadRecord): Promise<DownloadedSurahMetadata> {
    const db = await openDb();
    const key = record.key || makeDownloadKey(record.reciterId, record.surahId);

    const metadata: DownloadedSurahMetadata = {
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

    return new Promise<DownloadedSurahMetadata>((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readwrite');
      const metaStore = tx.objectStore(METADATA_STORE);
      const blobsStore = tx.objectStore(BLOBS_STORE);

      metaStore.put(metadata);
      if (record.blob) {
        blobsStore.put({ key, blob: record.blob });
      }

      // CRITICAL (F-01 fix): Resolve ONLY when the transaction successfully commits to disk!
      tx.oncomplete = () => {
        const meta = toMetadata(metadata);
        if (meta) {
          resolve(meta);
        } else {
          reject(new Error('Failed to transform saved metadata'));
        }
      };

      tx.onerror = () => {
        reject(mapError(tx.error));
      };

      tx.onabort = () => {
        reject(mapError(tx.error));
      };
    });
  },

  async getMetadata(reciterId: number | string, surahId: number | string): Promise<DownloadedSurahMetadata | null> {
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

  async get(reciterId: number | string, surahId: number | string): Promise<DownloadedAudioRecord | null> {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE, BLOBS_STORE], 'readonly');
      const metaStore = tx.objectStore(METADATA_STORE);
      const blobsStore = tx.objectStore(BLOBS_STORE);

      let meta: DownloadedSurahMetadata | null = null;
      let blobEntry: { key: string; blob: Blob } | null = null;

      metaStore.get(key).onsuccess = (e) => {
        const target = e.target as IDBRequest<DownloadedSurahMetadata | undefined>;
        meta = toMetadata(target.result);
      };

      blobsStore.get(key).onsuccess = (e) => {
        const target = e.target as IDBRequest<{ key: string; blob: Blob } | undefined>;
        blobEntry = target.result || null;
      };

      tx.oncomplete = () => {
        if (!meta) {
          resolve(null);
          return;
        }
        resolve({
          ...meta,
          blob: blobEntry?.blob || (new Blob([], { type: meta.mimeType })),
        });
      };

      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  async has(reciterId: number | string, surahId: number | string): Promise<boolean> {
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

  // Queries METADATA_STORE only - 0 Blobs read into memory
  async list(): Promise<DownloadedSurahMetadata[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(METADATA_STORE, 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result || [])
          .map(toMetadata)
          .filter((item): item is DownloadedSurahMetadata => item !== null)
          .sort((a, b) => String(b.downloadedAt).localeCompare(String(a.downloadedAt)));
        resolve(records);
      };

      request.onerror = () => reject(mapError(request.error));
      tx.onerror = () => reject(mapError(tx.error));
    });
  },

  async remove(reciterId: number | string, surahId: number | string): Promise<string> {
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

  async clearAll(): Promise<boolean> {
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

  async getObjectUrl(reciterId: number | string, surahId: number | string): Promise<string | null> {
    const db = await openDb();
    const key = makeDownloadKey(reciterId, surahId);

    return new Promise((resolve) => {
      const tx = db.transaction(BLOBS_STORE, 'readonly');
      const store = tx.objectStore(BLOBS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as { blob?: Blob } | undefined;
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

  revokeObjectUrl(url: string | null | undefined): void {
    if (url && String(url).startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {
        // ignore revoke errors
      }
    }
  },

  async fetchAudioBlob(
    sourceUrl: string,
    options?: { signal?: AbortSignal },
  ): Promise<{ blob: Blob; mimeType: string; sizeBytes: number }> {
    if (!sourceUrl) {
      throw new Error('Missing audio URL');
    }

    const response = await fetch(sourceUrl, {
      mode: 'cors',
      credentials: 'omit',
      signal: options?.signal,
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
