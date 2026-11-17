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
          dark: '#0B0B0B',
          card: '#141414',
          gray: '#222222',
          muted: '#8E8E93',
          border: '#2C2C2E',
          orange: '#FF5A1F',
          'orange-hover': '#E0480F',
          'orange-light': '#FFF3EE',
          'orange-dark': '#992B04',
          'orange-glow': 'rgba(255, 90, 31, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 20px -2px rgba(255, 90, 31, 0.35)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
