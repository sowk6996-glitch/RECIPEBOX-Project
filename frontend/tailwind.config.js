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
        brand: {
          50: '#fffbf7',
          100: '#fed7aa',
          200: '#ffedd5',
          500: '#f97316', // Vibrant Orange
          600: '#ea580c', // Amber-Orange
          700: '#c2410c', // Deep rust orange
          800: '#9a3412',
          900: '#431407'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
