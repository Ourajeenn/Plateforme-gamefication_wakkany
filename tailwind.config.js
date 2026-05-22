/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        monda: ['Monda', 'sans-serif'],
        heading: ['Cinzel', 'serif'],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.15)', filter: 'brightness(1.3)' },
        },
        lightning: {
          '0%, 100%': { opacity: '0' },
          '2%': { opacity: '0.8' },
          '3%': { opacity: '0' },
          '4%': { opacity: '0.6' },
          '5%': { opacity: '0' },
          '40%': { opacity: '0' },
          '41%': { opacity: '0.9' },
          '42%': { opacity: '0' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        breathe: 'breathe 2s ease-in-out infinite',
        lightning: 'lightning 6s infinite',
      }
    },
  },
  plugins: [],
}