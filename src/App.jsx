import React from 'react';
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

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#070A0D] text-slate-100 font-sans">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 pb-36 focus:outline-none">
          <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 items-start w-full">
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

            {/* Right Column: Quick Reciter & Recommended Surahs */}
            {!isSurahReadingPage && (
              <aside className="hidden xl:block xl:w-80 2xl:w-96 shrink-0 sticky top-0">
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
