/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        heritage: {
          ivory: '#FFFBF5',
          cream: '#F7F3E9',
          maroon: '#800020',
          darkMaroon: '#5A0016',
          saffron: '#FF9933',
          deepSaffron: '#E65100',
          gold: '#D4AF37',
          mutedGold: '#C5A059',
          indigo: '#1A237E',
          royalBlue: '#283593',
          darkSand: '#E2D9C8',
          charcoal: '#2D3142'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
