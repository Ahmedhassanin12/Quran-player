/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#070A0D',
          900: '#0B0F14',
          850: '#10161D',
          800: '#151D27',
          700: '#1E293B',
          600: '#2E3E52',
          500: '#475569',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        black: '#070A0D',
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
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        slowfade: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideup: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'none' },
        },
        slidedown: {
          from: { opacity: 0, transform: 'translateY(-20px)' },
          to: { opacity: 1, transform: 'none' },
        },
        slideleft: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        slideright: {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        wave: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '22px' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)' },
        },
      },
    },
  },
  plugins: [],
};
