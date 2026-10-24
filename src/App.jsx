import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Sidebar, QuranPlayer, TopPlay } from './components';
import {
  ArtistDetails,
  TopReaders,
  Discover,
  SuraDetails,
} from './pages';

const App = () => {
  const location = useLocation();
  const isSurahReadingPage = location.pathname.startsWith('/surah/');

  // Precision mobile dynamic viewport calculation
  useEffect(() => {
    const updateAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`,
      );
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
    };
  }, []);

  return (
    <div className="relative flex app-viewport w-full overflow-hidden bg-midnight-950 text-slate-100 font-sans">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 min-w-0 overflow-y-auto px-2 sm:px-3 lg:px-4 py-3 pb-6 lg:pb-32 focus:outline-none">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-4 items-start w-full">
            {/* Primary Router Outlet */}
            <div className="flex-1 min-w-0 w-full">
              <Routes>
                <Route path="/" element={<Discover />} />
                <Route path="/top-reciters" element={<TopReaders />} />
                <Route path="/reciters" element={<TopReaders />} />
                <Route path="/reader/:id" element={<ArtistDetails />} />
                <Route path="/surah/:surahId" element={<SuraDetails />} />
                <Route path="*" element={<Discover />} />
              </Routes>
            </div>

            {/* Right Column: Quick Reciter & Recommended Surahs (Ultra-wide screens only) */}
            {!isSurahReadingPage && (
              <aside className="hidden 2xl:block 2xl:w-80 shrink-0 sticky top-0">
                <TopPlay />
              </aside>
            )}
          </div>
        </main>

        {/* Persistent Bottom Audio Player */}
        <QuranPlayer />
      </div>
    </div>
  );
};

export default App;
