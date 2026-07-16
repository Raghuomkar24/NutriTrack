/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        accent: {
          orange: '#ea580c',
          amber: '#d97706',
          coral: '#f97316',
        },
        stage: {
          low:      '#475569',  /* slate — 0-30% */
          active:   '#16a34a',  /* green — 31-99% */
          complete: '#f97316',  /* coral — 100% celebration */
        },
        dark: {
          bg: '#070b19',
          card: 'rgba(30, 41, 59, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass':        '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover':  '0 8px 32px 0 rgba(22, 163, 74, 0.25)',
        'glass-coral':  '0 8px 32px 0 rgba(249, 115, 22, 0.30)',
        'elevate-coral':'0 20px 50px rgba(249, 115, 22, 0.25)',
      },
      keyframes: {
        'water-slosh': {
          '0%':   { transform: 'translateX(0) scaleX(1)' },
          '20%':  { transform: 'translateX(-4px) scaleX(1.04)' },
          '40%':  { transform: 'translateX(4px) scaleX(0.97)' },
          '60%':  { transform: 'translateX(-2px) scaleX(1.02)' },
          '80%':  { transform: 'translateX(1px) scaleX(0.99)' },
          '100%': { transform: 'translateX(0) scaleX(1)' },
        },
        'btn-spring': {
          '0%':   { transform: 'scale(1)' },
          '30%':  { transform: 'scale(0.88)' },
          '60%':  { transform: 'scale(1.08)' },
          '80%':  { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        'checkbox-spring': {
          '0%':   { transform: 'scale(1) rotate(0deg)' },
          '20%':  { transform: 'scale(0.8) rotate(-5deg)' },
          '55%':  { transform: 'scale(1.2) rotate(3deg)' },
          '75%':  { transform: 'scale(0.95) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'ring-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))' },
          '50%':       { filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.9))' },
        },
        'base-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249,115,22,0.4)' },
          '50%':       { boxShadow: '0 0 0 14px rgba(249,115,22,0)' },
        },
        'card-elevate': {
          '0%':   { transform: 'translateY(0)',    boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
          '50%':  { transform: 'translateY(-6px)', boxShadow: '0 24px 56px rgba(249,115,22,0.35)' },
          '100%': { transform: 'translateY(-3px)', boxShadow: '0 14px 36px rgba(249,115,22,0.22)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
        'nav-fade-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'water-slosh':    'water-slosh 600ms cubic-bezier(0.36,0.07,0.19,0.97) forwards',
        'btn-spring':     'btn-spring 350ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'checkbox-spring':'checkbox-spring 450ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'ring-pulse':     'ring-pulse 1.5s ease-in-out infinite',
        'base-pulse':     'base-pulse 1.2s ease-out infinite',
        'card-elevate':   'card-elevate 400ms cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':        'shimmer 2s linear infinite',
        'nav-fade-in':    'nav-fade-in 300ms ease-out both',
      },
    },
  },
  plugins: [],
}
