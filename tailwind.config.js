/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050403',
          900: '#090807',
          850: '#0e0c0a',
          800: '#14110e',
          750: '#1a1612',
          700: '#231d18',
          600: '#322a22',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        copper: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      boxShadow: {
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glow-amber-lg': '0 0 40px -6px rgba(245, 158, 11, 0.45)',
        'glow-copper': '0 0 30px -5px rgba(234, 88, 12, 0.35)',
        'luxury-card': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
