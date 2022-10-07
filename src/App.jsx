import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";

import { Searchbar, Sidebar, QuranPlayer, TopPlay } from "./components";
import {
  ArtistDetails,
  TopReaders,
  Discover,
  // Search,
  SuraDetails,
  // TopSurah,
} from "./pages";

const App = () => {
  const { activeSura } = useSelector((state) => state.player);

  return (
    <div className="relative flex">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-[#121286]">
        <div className="invisible">
          <Searchbar />
        </div>
        <div className="px-6 h-[calc(100vh-72px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
          <div className="flex-1 h-fit pb-40">
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/top-reciters" element={<TopReaders />} />
              {/* <Route path="/top-Surah" element={<TopSurah />} /> */}
              <Route path="/reader/:id" element={<ArtistDetails />} />
              <Route path="/surah/:surahId" element={<SuraDetails />} />
              {/* <Route path="/search/:searchTerm" element={<Search />} /> */}
            </Routes>
          </div>
          <div className="xl:sticky relative top-0 h-fit">
            <TopPlay />
          </div>
        </div>
      </div>

      {activeSura?.id && (
        <div className="absolute h-28 bottom-0 left-0 right-0 flex animate-slideup bg-gradient-to-br from-white/10 to-[#2a2a80] backdrop-blur-lg rounded-t-3xl z-10">
          <QuranPlayer />
        </div>
      )}
    </div>
  );
};

export default App;
