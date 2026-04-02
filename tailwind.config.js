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
    },
  },
  plugins: [],
}