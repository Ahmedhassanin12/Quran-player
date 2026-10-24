import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { RiCloseLine } from 'react-icons/ri';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { links } from '../assets/constants';
import { RubElHizbIcon, ReciterAvatar } from './IslamicArtwork';
import InstallPwaButton from './InstallPwaButton';

const NavLinks = ({ handleClick }) => (
  <nav className="flex flex-col space-y-1.5 mt-6">
    {links.map((item) => (
      <NavLink
        to={item.to}
        key={item.name}
        end={item.to === '/'}
        onClick={() => handleClick && handleClick()}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/60'
          }`
        }
      >
        <item.icon className="h-5 w-5 mr-3 shrink-0" />
        <span>{item.name}</span>
      </NavLink>
    ))}
  </nav>
);

const Sidebar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentReciter } = useSelector((state) => state.player);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen shrink-0 bg-midnight-850 border-r border-midnight-700/80 p-5 select-none">
        <div>
          {/* Logo & Brand Header */}
          <Link to="/" className="flex items-center space-x-3 px-2 py-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-950/60 group-hover:scale-105 transition-transform">
              <RubElHizbIcon className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h1 className="font-arabic font-bold text-xl text-slate-100 tracking-wide leading-none group-hover:text-indigo-400 transition-colors">
                القرآن الكريم
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                Quran Kareem Player
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
            <div className="p-3.5 rounded-lg bg-midnight-800 border border-midnight-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Current Reciter
                </span>
                <Link
                  to="/top-reciters"
                  className="text-[11px] text-slate-400 hover:underline hover:text-indigo-300"
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
                  <p className="text-[11px] text-indigo-300/90 font-arabic truncate mt-0.5">
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md">
              <RubElHizbIcon className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h2 className="font-arabic font-bold text-xl text-slate-100">
                القرآن الكريم
              </h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Quran Player
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
