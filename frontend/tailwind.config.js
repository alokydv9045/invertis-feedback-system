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
          DEFAULT: '#004ac6',
          container: '#2563eb',
          fixed: '#dbe1ff',
          'fixed-dim': '#b4c5ff',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          DEFAULT: '#00687a',
          container: '#57dffe',
          fixed: '#acedff',
          'fixed-dim': '#4cd7f6',
        },
        tertiary: {
          DEFAULT: '#9300a9',
          container: '#b71bcf',
          fixed: '#ffd6fd',
          'fixed-dim': '#fbabff',
        },
        surface: {
          DEFAULT: '#faf8ff',
          bright: '#faf8ff',
          dim: '#d9d9e5',
          variant: '#e1e2ed',
          container: {
            lowest: '#ffffff',
            low: '#f3f3fe',
            DEFAULT: '#ededf9',
            high: '#e7e7f3',
            highest: '#e1e2ed',
          }
        },
        outline: {
          DEFAULT: '#737686',
          variant: '#c3c6d7',
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
