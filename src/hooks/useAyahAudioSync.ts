import { useState, useEffect } from 'react';
import { getPageForAyah } from '../assets/mushafMetadata';
import { storageService } from '../services/storageService';
import type { AudioTimestamp } from '../types';

export interface UseAyahAudioSyncParams {
  isCurrentSurah: boolean | null;
  timestamps: AudioTimestamp[];
  timestampMap: Record<string, AudioTimestamp>;
  isHifzActive: boolean;
  hifzStart: number;
  hifzEnd: number;
  hifzCurrentLoop: number;
  hifzTargetLoops: number;
  numSurahId: number;
  mushafPage: number;
  onSeekToVerseTime: (seconds: number) => void;
  onLoopStep: () => void;
  onLoopComplete: () => void;
  onPageChange: (page: number) => void;
}

export function useAyahAudioSync({
  isCurrentSurah,
  timestamps,
  timestampMap,
  isHifzActive,
  hifzStart,
  hifzEnd,
  hifzCurrentLoop,
  hifzTargetLoops,
  numSurahId,
  mushafPage,
  onSeekToVerseTime,
  onLoopStep,
  onLoopComplete,
  onPageChange,
}: UseAyahAudioSyncParams) {
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isCurrentSurah || timestamps.length === 0) {
      setActiveVerseKey(null);
      return undefined;
    }

    const handleAudioTime = (e: Event) => {
      const customEvent = e as CustomEvent<{ currentTime: number }>;
      const currentTimeMs = (customEvent.detail?.currentTime || 0) * 1000;

      // Hifz looping boundary check
      if (isHifzActive) {
        const startKey = `${numSurahId}:${hifzStart}`;
        const endKey = `${numSurahId}:${hifzEnd}`;
        const startTs = timestampMap[startKey];
        const endTs = timestampMap[endKey];

        if (endTs && currentTimeMs >= endTs.timestamp_to) {
          if (hifzCurrentLoop < hifzTargetLoops || hifzTargetLoops === 0) {
            onLoopStep();
            if (startTs) {
              onSeekToVerseTime(startTs.timestamp_from / 1000);
            }
          } else {
            onLoopComplete();
          }
          return;
        }
      }

      // Find current active verse segment
      const current = timestamps.find(
        (t) => currentTimeMs >= t.timestamp_from && currentTimeMs < t.timestamp_to,
      );

      if (current && current.verse_key !== activeVerseKey) {
        setActiveVerseKey(current.verse_key);

        // Synchronize Mushaf page with reciting Ayah
        const [s, a] = current.verse_key.split(':').map(Number);
        const targetPage = getPageForAyah(s, a);
        if (targetPage && targetPage !== mushafPage) {
          onPageChange(targetPage);
          storageService.saveLastMushafPage(targetPage);
        }
      }
    };

    window.addEventListener('quran-audio-time', handleAudioTime);
    return () => window.removeEventListener('quran-audio-time', handleAudioTime);
  }, [
    isCurrentSurah,
    timestamps,
    activeVerseKey,
    isHifzActive,
    hifzStart,
    hifzEnd,
    hifzCurrentLoop,
    hifzTargetLoops,
    numSurahId,
    timestampMap,
    mushafPage,
    onSeekToVerseTime,
    onLoopStep,
    onLoopComplete,
    onPageChange,
  ]);

  return { activeVerseKey, setActiveVerseKey };
}
