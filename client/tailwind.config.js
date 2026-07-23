/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1E40AF', light: '#3B82F6' },
        high: { DEFAULT: '#16A34A', bg: '#F0FDF4' },
        medium: { DEFAULT: '#D97706', bg: '#FFFBEB' },
        low: { DEFAULT: '#DC2626', bg: '#FEF2F2' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
