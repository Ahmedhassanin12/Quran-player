import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { RiCloseLine } from 'react-icons/ri';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { links } from '../assets/constants';
import { RubElHizbIcon, ReciterAvatar } from './IslamicArtwork';
import InstallPwaButton from './InstallPwaButton';

const NavLinks = ({ handleClick }) => (
  <nav className="flex flex-col space-y-1 mt-6">
    {links.map((item) => (
      <NavLink
        to={item.to}
        key={item.name}
        end={item.to === '/'}
        onClick={() => handleClick && handleClick()}
        className={({ isActive }) =>
          `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-midnight-800 text-slate-100 border border-midnight-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/40'
          }`
        }
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4.5 w-4.5 shrink-0" />
          <span>{item.name}</span>
        </div>
        {item.arabicName && (
          <span className="font-arabic text-xs text-slate-400">
            {item.arabicName}
          </span>
        )}
      </NavLink>
    ))}
  </nav>
);

const Sidebar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentReciter } = useSelector((state) => state.player);

  return (
    <>
      {/* Desktop Sidebar (Linear charcoal surface #0D0F12) */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen shrink-0 bg-midnight-900 border-r border-midnight-700/60 p-5 select-none">
        <div>
          {/* Logo & Brand Header */}
          <Link to="/" className="flex items-center space-x-3 px-2 py-3 group">
            <div className="w-10 h-10 rounded-lg bg-midnight-850 border border-midnight-700/80 flex items-center justify-center text-indigo-400 shadow-sm group-hover:border-indigo-500/50 transition-colors">
              <RubElHizbIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-arabic font-bold text-xl text-slate-100 tracking-wide leading-none group-hover:text-indigo-400 transition-colors">
                القرآن الكريم
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                Quran Kareem
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <NavLinks />
        </div>

        {/* Bottom Actions: PWA Install + Active Reciter Card */}
        <div className="space-y-3">
          <InstallPwaButton />

          {currentReciter && (
            <div className="p-3.5 rounded-lg bg-midnight-850 border border-midnight-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Current Reciter
                </span>
                <Link
                  to="/top-reciters"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Change
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <ReciterAvatar
                  photoUrl={currentReciter.photo_url}
                  name={currentReciter.reciter_name}
                  arabicName={currentReciter.arabic_name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {currentReciter.reciter_name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-arabic truncate mt-0.5">
                    {currentReciter.arabic_name || currentReciter.style}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="p-2.5 rounded-lg bg-midnight-800 border border-midnight-700 text-slate-200 hover:text-indigo-400 shadow-lg focus:outline-none"
        >
          {mobileMenuOpen ? (
            <RiCloseLine className="w-6 h-6" />
          ) : (
            <HiOutlineMenuAlt2 className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`md:hidden fixed top-0 bottom-0 left-0 w-3/4 max-w-xs bg-midnight-900 border-r border-midnight-700 z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-1 py-2"
          >
            <div className="w-10 h-10 rounded-lg bg-midnight-800 border border-midnight-700/80 flex items-center justify-center text-indigo-300 shadow-sm">
              <RubElHizbIcon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-arabic font-bold text-xl text-slate-100">
                القرآن الكريم
              </h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Quran Kareem
              </p>
            </div>
          </Link>
          <NavLinks handleClick={() => setMobileMenuOpen(false)} />
        </div>

        {/* Mobile Drawer Footer: PWA Install + Active Reciter */}
        <div className="space-y-3">
          <InstallPwaButton />

          {currentReciter && (
            <div className="p-3 rounded-lg bg-midnight-800 border border-midnight-700">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                Active Reciter
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {currentReciter.reciter_name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentReciter.style}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
