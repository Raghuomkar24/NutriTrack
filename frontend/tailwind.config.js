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
        // Redefined to map to the new warm editorial light-mode color scheme
        slate: {
          50: 'rgba(255, 255, 255, 0.3)',
          100: 'rgba(255, 255, 255, 0.45)',
          200: 'rgba(255, 255, 255, 0.6)',
          300: '#FFE3D4', // peach highlight / apricot border
          400: '#A09893',
          500: '#8A817C', // Soft Taupe
          600: '#7A716C',
          700: '#5C5551',
          800: '#463F3A', // Charcoal/Espresso
          900: '#332D29',
          950: '#25201C',
        },
        primary: {
          50: '#FFF1E6',  // Peach Cream
          100: '#FFE3D4', // Warm Apricot
          200: '#FFD2BD',
          500: '#FF9E8A', // Smooth Coral Red
          600: '#B56A45', // Terracotta
          700: '#9C5432',
        },
        emerald: {
          50: 'rgba(152, 255, 207, 0.1)',
          100: 'rgba(152, 255, 207, 0.2)',
          200: 'rgba(152, 255, 207, 0.35)',
          500: '#8ce6bf', // Sage/Seafoam Green blend
          600: '#6fc29d',
        },
        blue: {
          50: 'rgba(129, 181, 202, 0.1)',
          100: 'rgba(129, 181, 202, 0.2)',
          200: 'rgba(129, 181, 202, 0.35)',
          500: '#81b5ca', // Soft Sky Blue
          600: '#6ea2b7',
        },
        orange: {
          50: '#FFF1E6',
          100: '#FFE3D4',
          500: '#FF9E8A', // Smooth Coral Red
          600: '#B56A45', // Terracotta
        },
        amber: {
          50: '#FFF1E6',
          500: '#B56A45', // Terracotta
          600: '#9C5432',
        },
        accent: {
          orange: '#B56A45',
          amber: '#B56A45',
          coral: '#FF9E8A',
          blue: '#81b5ca',
        },
        stage: {
          low:      '#F4F3EE',  /* Parchment */
          active:   '#FF9E8A',  /* Coral Red */
          complete: '#B56A45',  /* Terracotta */
        },
        light: {
          bg: '#FFF1E6',
          card: 'rgba(255, 255, 255, 0.55)',
          border: 'rgba(255, 255, 255, 0.4)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card':         '0 10px 30px rgba(181, 106, 69, 0.05)',
        'card-hover':   '0 15px 35px rgba(181, 106, 69, 0.1)',
        'card-coral':   '0 10px 30px rgba(255, 158, 138, 0.15)',
        'elevate-coral':'0 20px 40px rgba(181, 106, 69, 0.15)',
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
          '0%':   { transform: 'scale(1)' },
          '35%':  { transform: 'scale(0.8)' },
          '70%':  { transform: 'scale(1.15)' },
          '85%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'ring-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(255,158,138,0.5))' },
          '50%':       { filter: 'drop-shadow(0 0 20px rgba(255,158,138,0.85))' },
        },
        'base-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,158,138,0.4)' },
          '50%':       { boxShadow: '0 0 0 14px rgba(255,158,138,0)' },
        },
        'card-elevate': {
          '0%':   { transform: 'translateY(0)',    boxShadow: '0 10px 30px rgba(181, 106, 69, 0.05)' },
          '50%':  { transform: 'translateY(-6px)', boxShadow: '0 20px 40px rgba(181, 106, 69, 0.15)' },
          '100%': { transform: 'translateY(-3px)', boxShadow: '0 14px 35px rgba(181, 106, 69, 0.1)' },
        },
        'shimmer': {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition:  '200% center' },
        },
        'nav-fade-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
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
        'fade-up':        'fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
