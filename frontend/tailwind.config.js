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
        'erp-navy': '#1a2233',
        'erp-navy-light': '#242f45',
        'erp-orange': '#f15a24',
        'erp-blue': '#2d3fe0',
        'erp-gray': '#f5f7fa',
        'erp-border': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
