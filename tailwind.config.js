/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#090B10', // Canvas background
          900: '#0D0F17', // Player & deep surfaces
          850: '#10131B', // Surface / Card base
          800: '#171B26', // Elevated / Active cards
          750: '#1F2433', // Hover state
          700: '#212638', // Border default
          600: '#333C54',
          500: '#4D5875',
        },
        indigo: {
          300: '#A5B4FC',
          400: '#818CF8', // Hover accent
          500: '#6366F1', // Primary accent
          600: '#4F46E5',
          700: '#4338CA', // Active border
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        slate: {
          100: '#F1F5F9', // Primary text
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8', // Secondary text
          500: '#64748B', // Muted text
          600: '#475569',
        },
        black: '#090B10',
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
        slowfade: 'slowfade 0.4s ease-out',
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
