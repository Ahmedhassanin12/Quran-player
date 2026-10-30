/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#08090B', // Main application background (Linear canvas)
          900: '#0D0F12', // Sidebar & bottom player background
          850: '#111318', // Primary surface (cards, base containers)
          800: '#171A21', // Elevated surface (modals, active cards)
          750: '#1C2029', // Hover surface
          700: '#242833', // Subtle borders default
          600: '#313645', // Borders hover / elevated border
          500: '#454B5E', // Muted borders
          400: '#5C637A',
        },
        indigo: {
          300: '#A5A6FF', // Light accent text
          400: '#8889FF', // Accent hover
          500: '#7778F6', // Primary accent (Linear indigo)
          600: '#6869E8', // Accent active / pressed
          700: '#5556D4',
          800: '#3E40A8',
          900: '#27286E',
          950: '#141538',
        },
        slate: {
          100: '#F0F1F5', // Primary text (high contrast)
          200: '#D8DAE2',
          300: '#BCBFC9',
          400: '#A0A5B2', // Secondary text
          500: '#737988', // Muted text
          600: '#525866', // Subtle / disabled text
        },
        black: '#08090B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        quran: ['"Scheherazade New"', '"Amiri"', 'Traditional Arabic', 'serif'],
      },
      animation: {
        slideup: 'slideup 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        slidedown: 'slidedown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        slideleft: 'slideleft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        slideright: 'slideright 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        wave: 'wave 1.2s ease-in-out infinite',
        slowfade: 'slowfade 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slowfade: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideup: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'none' },
        },
        slidedown: {
          from: { opacity: 0, transform: 'translateY(-16px)' },
          to: { opacity: 1, transform: 'none' },
        },
        slideleft: {
          from: { opacity: 0, transform: 'translateX(-16px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideright: {
          from: { opacity: 0, transform: 'translateX(16px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        wave: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '20px' },
        },
      },
    },
  },
  plugins: [],
};
