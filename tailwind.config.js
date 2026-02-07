/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        gis: {
          'bg-primary': '#1a1a1e',
          'bg-secondary': '#242428',
          'bg-tertiary': '#2e2e34',
          'border': '#3a3a42',
          'text-primary': '#e8e8ec',
          'text-secondary': '#a0a0a8',
          'text-muted': '#6a6a72',
          'accent': '#4a9eff',
          'accent-hover': '#6ab0ff',
        },
      },
    },
  },
  plugins: [],
};
