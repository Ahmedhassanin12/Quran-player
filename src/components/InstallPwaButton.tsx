import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownloadCloud, FiShare, FiX } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface InstallPwaButtonProps {
  className?: string;
}

const isIosDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua)
    || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
};

const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const isStandalone = typeof window !== 'undefined'
      && (window.matchMedia('(display-mode: standalone)').matches
        || Boolean((window.navigator as unknown as { standalone?: boolean })?.standalone));

    if (isStandalone) {
      setIsInstalled(true);
      return undefined;
    }

    if (isIosDevice()) {
      setIsIos(true);
      return undefined;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
    } catch (_) {
      // ignore prompt abort
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || (!isInstallable && !isIos)) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleInstallClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-midnight-800/90 hover:bg-midnight-750 border border-midnight-700/80 hover:border-midnight-600 text-slate-200 text-xs font-medium transition-all group ${className}`}
        title={t('pwa.installApp')}
      >
        <div className="w-7 h-7 rounded-lg bg-midnight-750 border border-midnight-700 flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors shrink-0">
          <FiDownloadCloud size={15} />
        </div>
        <div className="text-start min-w-0 flex-1">
          <p className="font-semibold text-slate-200 truncate group-hover:text-slate-100">
            {t('pwa.installApp')}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {t('pwa.offlineFullscreen')}
          </p>
        </div>
      </button>

      {isIos && showIosHelp && (
        <div className="mt-2 p-3 rounded-lg bg-slate-800/80 border border-indigo-500/30 text-[11px] text-slate-200 relative">
          <button
            type="button"
            onClick={() => setShowIosHelp(false)}
            className="absolute top-2 end-2 text-slate-400 hover:text-slate-200"
            aria-label={t('common.close')}
          >
            <FiX size={12} />
          </button>
          <p className="flex items-center flex-wrap gap-1 pe-4">
            <span>{t('pwa.iosTap')}</span>
            <FiShare size={13} className="inline text-indigo-300" />
            <strong>{t('pwa.iosShare')}</strong>
            <span>{t('pwa.iosAddHome')}</span>
            <strong>{t('pwa.iosAddHomeAction')}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default InstallPwaButton;
