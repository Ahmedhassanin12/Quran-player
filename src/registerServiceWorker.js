export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for service worker updates periodically
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; notify user or auto-update
                    // eslint-disable-next-line no-console
                    console.log('New Quran Player update available. Reload to update.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn('PWA Service Worker registration error:', error);
        });
    });
  }
};
