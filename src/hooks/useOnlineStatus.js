import { useEffect, useState } from 'react';

const getOnline = () =>
  typeof navigator === 'undefined' ? true : navigator.onLine !== false;

/**
 * Tracks browser online/offline status.
 * Defaults to online until the first offline event (SSR-safe).
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(getOnline);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    setIsOnline(getOnline());
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;
