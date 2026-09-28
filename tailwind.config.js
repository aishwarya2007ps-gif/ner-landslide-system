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
        brand: {
          950: '#070d1e',
          900: '#0b152d',
          800: '#142143',
          700: '#1e305b',
          teal: '#14b8a6',
          warning: '#f59e0b',
          danger: '#ef4444',
          high: '#f97316',
          safe: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
