/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#A51C30', // Harvard Crimson
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F9CDD4',
          300: '#F3A4B0',
          400: '#EB7388',
          500: '#DE4A5F',
          600: '#C9334A',
          700: '#A51C30', // Main crimson
          800: '#8B1829',
          900: '#771626',
        },
        secondary: {
          DEFAULT: '#1E1E1E',
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#717171',
          500: '#4A4A4A',
          600: '#2D2D2D',
          700: '#1E1E1E',
          800: '#0F0F0F',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

