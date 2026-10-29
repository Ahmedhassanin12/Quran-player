export interface DownloadedSurahMetadata {
  key: string;
  surahId: number;
  reciterId: number;
  reciterName: string;
  surahName: string;
  arabicName: string;
  sourceUrl: string;
  mimeType: string;
  sizeBytes: number;
  downloadedAt: string;
}

export interface DownloadedAudioRecord extends DownloadedSurahMetadata {
  blob: Blob;
}

export type DownloadStatus = 'idle' | 'downloading' | 'error';

export interface DownloadsState {
  items: DownloadedSurahMetadata[];
  downloadedKeys: Record<string, boolean>;
  statusByKey: Record<string, DownloadStatus>;
  errorByKey: Record<string, string | null>;
  hydrated: boolean;
  hydrating: boolean;
}
