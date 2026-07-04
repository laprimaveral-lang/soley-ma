/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C5A880', // Beige gold accent
        secondary: '#111111', // Deep Black
        background: '#FFFFFF', // White
        ivory: '#FAFAF8',
        'off-white': '#F5F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or any premium font
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'float': '0 20px 40px -20px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
