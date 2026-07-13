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
        },
        dark: {
          bg: '#0b1329',
          card: 'rgba(30, 41, 59, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(22, 163, 74, 0.25)',
      }
    },
  },
  plugins: [],
}
