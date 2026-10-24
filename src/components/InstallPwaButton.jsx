import React, { useState, useEffect } from 'react';
import { FiDownloadCloud } from 'react-icons/fi';

const InstallPwaButton = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    } catch (_) {}
    setDeferredPrompt(null);
  };

  if (isInstalled || !isInstallable) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-slate-100 text-xs font-semibold shadow-md transition-all group ${className}`}
      title="Install Quran Kareem on your device"
    >
      <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform shrink-0">
        <FiDownloadCloud size={16} />
      </div>
      <div className="text-left min-w-0 flex-1">
        <p className="font-semibold text-slate-100 truncate group-hover:text-indigo-200">
          Install App
        </p>
        <p className="text-[10px] text-indigo-300/80 truncate">
          Offline & Fullscreen
        </p>
      </div>
    </button>
  );
};

export default InstallPwaButton;
