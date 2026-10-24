import React, { useState, useEffect } from 'react';
import { FiDownloadCloud, FiShare, FiX } from 'react-icons/fi';

const isIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  // iPadOS 13+ reports as "Macintosh", so also check touch support
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
};

const InstallPwaButton = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    if (isIosDevice()) {
      setIsIos(true);
      return; // no beforeinstallprompt on iOS
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
    if (isIos) {
      setShowIosHelp((v) => !v);
      return;
    }
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

  if (isInstalled || (!isInstallable && !isIos)) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleInstallClick}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-slate-100 text-xs font-semibold shadow-md transition-all group ${className}`}
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

      {isIos && showIosHelp && (
        <div className="mt-2 p-3 rounded-lg bg-slate-800/80 border border-indigo-500/30 text-[11px] text-slate-200 relative">
          <button
            type="button"
            onClick={() => setShowIosHelp(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            <FiX size={12} />
          </button>
          <p className="flex items-center flex-wrap gap-1">
            Tap <FiShare size={13} className="inline text-indigo-300" />
            <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstallPwaButton;