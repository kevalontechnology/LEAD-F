/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f8fd',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#6ed1f7',
          400: '#2bb5d8',
          500: '#1191bf',
          600: '#0a4b7c',
          700: '#003865',
          800: '#042847',
          900: '#021c33',
          950: '#011020',
        },
        kevalon: {
          cyan: '#34b3d6',
          teal: '#2bb5d8',
          blue: '#0a4b7c',
          navy: '#003865',
          dark: '#021c33'
        }
      }
    },
  },
  plugins: [],
}
