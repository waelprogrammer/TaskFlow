/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#1e293b',
          200: '#172033',
          300: '#0f172a',
          400: '#0a0f1e',
        },
      },
    },
  },
  plugins: [],
};
