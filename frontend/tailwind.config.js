/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SoloCloud Brand Colors
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Sky blue principal - cloud
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        violet: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Violet principal - tech
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        primary: {
          DEFAULT: '#0ea5e9',  // Sky blue
          dark: '#0369a1',
          light: '#38bdf8',
        },
        secondary: {
          DEFAULT: '#a855f7',  // Violet
          dark: '#7e22ce',
          light: '#c084fc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cloud': '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
        'cloud-lg': '0 10px 25px 0 rgba(14, 165, 233, 0.2)',
        'violet': '0 4px 14px 0 rgba(168, 85, 247, 0.15)',
        'violet-lg': '0 10px 25px 0 rgba(168, 85, 247, 0.2)',
      },
      backgroundImage: {
        'gradient-solocloud': 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
        'gradient-solocloud-alt': 'linear-gradient(135deg, #38bdf8 0%, #c084fc 100%)',
      }
    },
  },
  plugins: [],
}
