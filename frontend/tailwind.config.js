/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SoloCloud Brand Colors - Híbrido Solo (verde) + Cloud (azul)
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',  // Emerald - representa SOLO (terra)
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Sky blue - representa CLOUD (céu/nuvem)
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
          500: '#a855f7',  // Violet - tech premium
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        primary: {
          DEFAULT: '#10b981',  // Emerald (SOLO)
          dark: '#047857',
          light: '#34d399',
        },
        secondary: {
          DEFAULT: '#0ea5e9',  // Sky (CLOUD)
          dark: '#0369a1',
          light: '#38bdf8',
        },
        accent: {
          DEFAULT: '#a855f7',  // Violet (TECH)
          dark: '#7e22ce',
          light: '#c084fc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'solo': '0 4px 14px 0 rgba(16, 185, 129, 0.15)',
        'solo-lg': '0 10px 25px 0 rgba(16, 185, 129, 0.2)',
        'cloud': '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
        'cloud-lg': '0 10px 25px 0 rgba(14, 165, 233, 0.2)',
        'solocloud': '0 10px 30px 0 rgba(16, 185, 129, 0.15), 0 5px 15px 0 rgba(14, 165, 233, 0.1)',
      },
      backgroundImage: {
        'gradient-solocloud': 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #a855f7 100%)',
        'gradient-solocloud-alt': 'linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #c084fc 100%)',
        'gradient-solo': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-cloud': 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
      }
    },
  },
  plugins: [],
}
