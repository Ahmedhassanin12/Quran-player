# القرآن الكريم — Quran Kareem Player

<div align="center">

![Quran Kareem Banner](https://github.com/user-attachments/assets/a5d546e4-05fb-45a1-96d8-fcae585a3fd8)

**A calm, authentic Quran listening and reading application built with modern craftsmanship.**

Featuring the exact 604-page King Fahd Madinah Mushaf, synchronized verse-by-verse recitation, curated Sunnah collections, Hifz memorization looping, and a restrained Linear-inspired dark aesthetic.

[![Live Demo (Vercel)](https://img.shields.io/badge/Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://quranplayer.vercel.app/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-2.9-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-1.8-764ABC?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Mushaf Tests](https://img.shields.io/badge/Mushaf_Tests-9%2F9_Passing-brightgreen?style=for-the-badge)](tests/mushaf.test.js)

</div>

---

## 📖 Highlights & Features

### 1. Authentic 604-Page Madinah Mushaf Mode
Faithful reproduction of the official **King Fahd Glorious Quran Complex (مجمع الملك فهد لطباعة المصحف الشريف)** edition with exactly 604 pages:
* **Zero Line Reflow**: Strict 15 lines per standard page matching the physical printed copy.
* **Dual Rendering Engines**:
  * **Calligraphic Plate Scan**: High-resolution 1260px official scans with pure white night-mode calligraphy (`خط أبيض ناصع`) and classic ivory parchment mode (`نمط ورقي عاجي`).
  * **15-Line Digital Typography Engine**: Responsive vector typography using authentic Uthmani script with interactive word/ayah popovers.
* **Navigation & Tools**: Instant Jump to Page (1–604), Surah & Juz headers, and persistent Mushaf bookmarks modal.

### 2. Versatile Quran Reading Modes
* **Madinah Mushaf Mode**: Exact page-by-page layout for physical Mushaf familiarity.
* **Structured Ayah Cards Mode**: Verse-by-verse presentation with sacred Uthmani calligraphy, authentic ayah end markers (`﴿٥﴾`), Saheeh International English translations, and 1-click **Jump to Ayah** audio seeking.
* **Continuous Flow Mode**: Continuous reading surface with real-time active recitation highlighting.
* **Historical Context & Commentary (Surah Info)**: Historical background, revelation period (Meccan vs. Medinan), and chapter reflections.

### 3. Precision Audio & Recitation Suite
* **Verse-Synchronized Audio**: Millisecond-accurate ayah timestamp segments matching audio playback to the highlighted verse in real time.
* **Interactive Top Scrubber "Tape"**: Scrub recitations directly from the player's top timeline edge.
* **Architectural Audio Player**: Floating island on desktop screens (`lg:rounded-2xl`), seamlessly docked with safe-area insets on mobile viewports.
* **Expanded Fullscreen Player**: Fullscreen recitation sanctuary featuring active Surah queue, quick navigation, and large typography.
* **Pitch-Preserving Speed Selector**: Speed adjustment from `0.80x` (slow Tajweed study) to `1.20x` (fluent review) with zero pitch distortion.
* **Sleep Sanctuary Timer**: Timed bedtime timer (15m, 30m, 45m, 60m) or end-of-surah mode with a smooth 30-second volume fade.
* **Hifz Memorization Looper**: Configurable loop count (1 to ∞) for memorizing specific verses or passages.

### 4. Curated Sunnah & Thematic Collections
Quick 1-click access to recommended Sunnah recitations with authentic Hadith citations:
* **Friday Light**: Surah Al-Kahf (*سنة الجمعة - الكهف*)
* **Nightly Protection**: Surah Al-Mulk & Surah As-Sajdah (*منجيات الليل*)
* **Daily Fortress**: Al-Ikhlas & Al-Mu'awwidhatayn (*المعوذات والإخلاص*)
* **Heart Softeners**: Surah Ar-Rahman, Al-Waqi'ah, Maryam, Taha, Qaf (*تلاوات خاشعة ومؤثرة*)
* **Juz 'Amma**: The complete 30th portion (37 chapters) for daily memorization.

### 5. Verified Global Qari Roster
Complete catalog of renowned Islamic reciters with verified audio sources across different recitation styles:
* **Murattal (مرتل)**: Sheikh Mishari Rashid al-Afasy, Mahmoud Khalil Al-Husary, Saad Al-Ghamdi, Abu Bakr Al-Shatri, Maher Al-Muaiqly, etc.
* **Mujawwad (مجود)**: Abdul Basit Abdus Samad, Muhammad Siddiq Al-Minshawi, Mustafa Ismail.
* **Mu'allim (معلم)**: Educational pacing for Tajweed practice.

### 6. Restrained Editorial Design (Linear Dark Palette)
Designed according to strict anti-UI-slop principles:
* **Calm Obsidian Palette**: Near-black backgrounds (`#08090B`), charcoal surfaces (`#0D0F12`, `#111318`, `#171A21`), and subtle borders (`#242833`).
* **Restrained Accents**: Subtle Linear indigo (`#7778F6`) reserved strictly for active playback and primary triggers.
* **Typography Hierarchy**: Scheherazade New and Amiri for sacred Arabic calligraphy, paired with Plus Jakarta Sans for the English UI.
* **Zero Visual Slop**: No artificial neon glows, dot grids, or crowded dashboard cards.

### 7. Progressive Web App (PWA) & Offline Ready
* **Installable**: One-click installation on iOS, Android, macOS, and Windows.
* **Offline Caching**: Cached UI assets and Surah metadata.
* **Dynamic Viewport**: Dynamic viewport height calculation (`100dvh`) preventing mobile browser navigation bar clipping.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18](https://reactjs.org/) | Component-driven UI |
| **Build Tool** | [Vite 2.9](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) | Global audio player state, active Surah, favorites, recents |
| **Data Fetching** | [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) | Quran.com v4 API caching and endpoint management |
| **Styling** | [Tailwind CSS 3.1](https://tailwindcss.com/) | Custom design tokens and responsive styling |
| **Icons** | [React Icons](https://react-icons.github.io/react-icons/) | Feather (`Fi*`) and Bootstrap/Material SVG vector icons |
| **Arabic Typography** | Scheherazade New & Amiri | Classical Uthmani Quranic script and diacritics |
| **Testing** | Node.js Test Runner | Automated 9-point regression test suite for 604-page Mushaf fidelity |

---

##  Getting Started

### Prerequisites
* **Node.js**: `18.0.0` or higher
* **npm**: `8.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ahmedhassanin12/Quran-player.git
   cd Quran-player
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled output will be generated in the `dist/` directory.

---

## 🧪 Testing & Verification

The project includes an automated regression test suite (`tests/mushaf.test.js`) verifying:
1. **Total Page Count**: Exactly 604 pages.
2. **Page Bounds & Sequence**: Continuity from page 1 to 604.
3. **Surah Al-Fatihah Frontispiece**: Page 1 bounds (`1:1` to `1:7`).
4. **Al-Baqarah Frontispiece**: Page 2 bounds (`2:1` to `2:5`).
5. **Standard 15-Line Page**: Page 3 bounds (`2:6` to `2:16`).
6. **Final Page**: Page 604 bounds (`112:1` to `114:6`).
7. **Ayah-to-Page Resolution**: Verified mappings for arbitrary verses (e.g. Ayat Al-Kursi `2:255`, Surat Ya-Sin `36:1`).
8. **Out-of-Bounds Clamping**: Safe boundary handling for invalid inputs.
9. **Asset CDN Routing**: Formatted 3-digit padded official CDN URLs.

To execute the test suite:
```bash
node tests/mushaf.test.js
```

---

## 📂 Project Structure

```
Quran-player/
├── public/                 # Static assets, icons, manifest.webmanifest
├── src/
│   ├── assets/             # Mushaf metadata (604 pages), collections data, reciters data
│   │   ├── collectionsData.js
│   │   ├── constants.js
│   │   ├── mushafMetadata.js
│   │   └── recitersData.js
│   ├── components/         # Reusable UI & reading components
│   │   ├── IslamicArtwork.jsx
│   │   ├── Mushaf/
│   │   │   ├── MushafAyahModal.jsx
│   │   │   ├── MushafBookmarksModal.jsx
│   │   │   ├── MushafNavigation.jsx
│   │   │   └── MushafPageRenderer.jsx
│   │   ├── QuranPlayer/
│   │   │   ├── Controls.jsx
│   │   │   ├── ExpandedPlayer.jsx
│   │   │   ├── Player.jsx
│   │   │   ├── Seekbar.jsx
│   │   │   ├── SleepTimerModal.jsx
│   │   │   ├── SpeedSelectorModal.jsx
│   │   │   ├── TopScrubber.jsx
│   │   │   ├── Track.jsx
│   │   │   ├── VolumeBar.jsx
│   │   │   └── index.jsx
│   │   ├── ContinueListeningBanner.jsx
│   │   ├── CuratedCollections.jsx
│   │   ├── DetailsHeader.jsx
│   │   ├── InstallPwaButton.jsx
│   │   ├── PlayPause.jsx
│   │   ├── Searchbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── SurahCard.jsx
│   ├── pages/              # Application views
│   │   ├── ArtistDetails.jsx
│   │   ├── Discover.jsx
│   │   ├── SuraDetails.jsx
│   │   └── TopReaders.jsx
│   ├── redux/              # Redux slices and RTK Query services
│   │   ├── features/playerSlice.js
│   │   ├── services/quranCore.js
│   │   └── store.js
│   ├── services/           # LocalStorage bookmark & progress persistence
│   │   └── storageService.js
│   ├── App.jsx             # Main application shell & router
│   ├── index.css           # Base styles, scrollbars, sliders, Tailwind directives
│   └── index.jsx           # React DOM root entry
├── tests/                  # Madinah Mushaf regression test suite
│   └── mushaf.test.js
├── tailwind.config.js      # Linear dark palette design tokens
├── vite.config.js          # Vite build configuration
└── package.json
```

---

## 📄 License & Attribution

* **Source Code**: Released under the [MIT License](LICENSE).
* **Quran Text & Translations**: Powered by [Quran.com API v4](https://api-docs.quran.com/) and [Tanzil](https://tanzil.net/).
* **Mushaf Page Plates**: King Fahd Glorious Quran Complex (مجمع الملك فهد لطباعة المصحف الشريف).
* **Audio Recitations**: Everyayah and Quran.com Audio CDN.

---

<div align="center">
  <b>والحمد لله رب العالمين</b>
</div>
