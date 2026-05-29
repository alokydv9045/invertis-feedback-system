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
          50: '#F4F6F8',
          100: '#E9EEF2',
          200: '#C8D4E1',
          300: '#A6BACF',
          400: '#6487A9',
          500: '#1D3557', // Changed to match Invertis theme primary
          600: '#1A304E',
          700: '#112034',
          800: '#0D1827',
          900: '#09101A',
        },
        accent: {
          50: '#FDF7F7',
          100: '#FBE8E9',
          200: '#F5C6C9',
          300: '#EFA4A8',
          400: '#E36067',
          500: '#FF2A00', // Changed to match Invertis theme orange
          600: '#CF333F',
          700: '#8A222A',
          800: '#671A20',
          900: '#451115',
        },
        invertis: {
          bg: '#F1FAEE', // Page background
          orange: '#FF2A00',
          blue: '#1D3557',
        },
        slate: {
          750: '#1e2d42',
        }
      },
      spacing: {
        3: '8px',   // xs
        3.5: '12px', // sm
        4: '16px',   // md
        6: '24px',   // lg
        8: '32px',   // xl
        10: '40px',  // 2xl
        12: '48px',  // 3xl
        14: '56px',  // 4xl
        16: '64px',  // 5xl
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
        'sm-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)',
        'md-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 6px rgba(0, 0, 0, 0.4)',
        'lg-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 15px rgba(0, 0, 0, 0.5)',
        'xl-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 25px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      opacity: {
        disabled: '0.5',
        muted: '0.65',
        hover: '0.8',
      },
    },
  },
  plugins: [],
}
