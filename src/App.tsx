import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar, QuranPlayer } from './components';
import {
  ArtistDetails,
  TopReaders,
  Discover,
  SuraDetails,
  Downloads,
} from './pages';
import { hydrateDownloads } from './redux/features/downloadsSlice';
import { useAppDispatch } from './redux/hooks';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

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

  // Hydrate offline library metadata from IndexedDB
  useEffect(() => {
    dispatch(hydrateDownloads());
  }, [dispatch]);

  return (
    <div className="relative flex app-viewport w-full overflow-hidden bg-midnight-950 text-slate-100 font-sans">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 pb-24 lg:pb-28 focus:outline-none">
          <div className="max-w-7xl mx-auto w-full">
            {/* Primary Router Outlet */}
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/top-reciters" element={<TopReaders />} />
              <Route path="/reciters" element={<TopReaders />} />
              <Route path="/reader/:id" element={<ArtistDetails />} />
              <Route path="/surah/:surahId" element={<SuraDetails />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="*" element={<Discover />} />
            </Routes>
          </div>
        </main>

        {/* Persistent Bottom Audio Player */}
        <QuranPlayer />
      </div>
    </div>
  );
};

export default App;
