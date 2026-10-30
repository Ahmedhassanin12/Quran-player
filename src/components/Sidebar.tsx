import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RiCloseLine } from 'react-icons/ri';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { useAppSelector } from '../redux/hooks';
import { selectCurrentReciter } from '../redux/features/playerSlice';
import { links } from '../assets/constants';
import { RubElHizbIcon, ReciterAvatar } from './IslamicArtwork';
import InstallPwaButton from './InstallPwaButton';
import LanguageSwitcher from './LanguageSwitcher';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { normalizeLanguage } from '../i18n';
import { getLocalizedReciterName } from '../utils/quranUtils';

export interface NavLinksProps {
  handleClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ handleClick }) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('nav.mainNavigation')} className="flex flex-col space-y-1 mt-6">
      {links.map((item) => (
        <NavLink
          to={item.to}
          key={item.to}
          end={item.to === '/'}
          onClick={() => handleClick && handleClick()}
          className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-midnight-800 text-slate-100 border border-midnight-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span>{t(item.labelKey)}</span>
          </div>
        </NavLink>
      ))}
    </nav>
  );
};

const Sidebar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  const isRtl = currentLang === 'ar';
  const currentReciter = useAppSelector(selectCurrentReciter);
  const isOnline = useOnlineStatus();

  const reciterDisplayName = getLocalizedReciterName(currentReciter, currentLang);
  const reciterStyleKey = (currentReciter?.style || 'Murattal') as 'Murattal' | 'Mujawwad' | 'Muallim';
  const reciterStyleLabel = t(`reciters.styles.${reciterStyleKey}`, { defaultValue: currentReciter?.style || '' });

  const closedDrawerTranslate = isRtl ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      {/* Desktop Sidebar (Linear charcoal surface #0D0F12) */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen shrink-0 bg-midnight-900 border-e border-midnight-700/60 p-5 select-none">
        <div>
          {/* Logo & Brand Header */}
          <Link to="/" className="flex items-center gap-3 px-2 py-3 group">
            <div className="w-10 h-10 rounded-lg bg-midnight-850 border border-midnight-700/80 flex items-center justify-center text-indigo-400 shadow-sm group-hover:border-indigo-500/50 transition-colors shrink-0">
              <RubElHizbIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-arabic font-bold text-xl text-slate-100 tracking-wide leading-none group-hover:text-indigo-400 transition-colors">
                {t('common.appName')}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase mt-1 truncate">
                {t('common.sacredRecitation')}
              </p>
            </div>
          </Link>

          {!isOnline && (
            <div className="mx-1 mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
              {t('nav.offlineNotice')}
            </div>
          )}

          {/* Navigation Links */}
          <NavLinks />
        </div>

        {/* Bottom Actions: Language Switcher + PWA Install + Active Reciter Card */}
        <div className="space-y-3">
          <LanguageSwitcher variant="sidebar" />
          <InstallPwaButton />

          {currentReciter && (
            <div className="p-3.5 rounded-lg bg-midnight-850 border border-midnight-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t('nav.currentReciter')}
                </span>
                <Link
                  to="/top-reciters"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  {t('nav.change')}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <ReciterAvatar
                  photoUrl={currentReciter.photo_url}
                  name={currentReciter.reciter_name}
                  arabicName={currentReciter.arabic_name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {reciterDisplayName}
                  </p>
                  <p className="text-[11px] text-indigo-300/90 truncate mt-0.5">
                    {reciterStyleLabel}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Controls: Quick Language Switcher + Menu Button */}
      <div className="md:hidden fixed top-3 end-3 z-50 flex items-center gap-2">
        <LanguageSwitcher variant="compact" />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          className="p-2 rounded-lg bg-midnight-850/90 border border-midnight-700/80 text-slate-200 hover:text-white shadow-lg backdrop-blur focus:outline-none"
        >
          {mobileMenuOpen ? (
            <RiCloseLine size={22} className="text-slate-100" />
          ) : (
            <HiOutlineMenuAlt2 size={22} className="text-slate-100" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-midnight-950/80 backdrop-blur-sm animate-slowfade"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed top-0 end-0 h-full w-4/5 max-w-xs bg-midnight-900 border-s border-midnight-700/80 p-6 pt-16 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : closedDrawerTranslate
        }`}
      >
        <div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-1 py-2"
          >
            <div className="w-9 h-9 rounded-lg bg-midnight-850 border border-midnight-700 flex items-center justify-center text-indigo-400 shrink-0">
              <RubElHizbIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="font-arabic font-bold text-lg text-slate-100 leading-none">
                {t('common.appName')}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1 truncate">
                {t('common.sacredRecitation')}
              </p>
            </div>
          </Link>

          {!isOnline && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed">
              {t('nav.offlineNotice')}
            </div>
          )}

          <NavLinks handleClick={() => setMobileMenuOpen(false)} />
        </div>

        {/* Mobile Drawer Footer: Language Switcher + PWA Install + Active Reciter */}
        <div className="space-y-3">
          <LanguageSwitcher variant="sidebar" />
          <InstallPwaButton />

          {currentReciter && (
            <div className="p-3 rounded-lg bg-midnight-800 border border-midnight-700">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t('nav.currentReciter')}
                </span>
                <Link
                  to="/top-reciters"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  {t('nav.change')}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <ReciterAvatar
                  photoUrl={currentReciter.photo_url}
                  name={currentReciter.reciter_name}
                  arabicName={currentReciter.arabic_name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {reciterDisplayName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {reciterStyleLabel}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
