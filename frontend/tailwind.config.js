// frontend/tailwind.config.js
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
          DEFAULT: '#FFA500', // Orange
          dark: '#FF8C00'     // Dark Orange
        },
        secondary: {
          DEFAULT: '#FFD700', // Yellow
          dark: '#FFC700'     // Dark Yellow
        },
        dark: {
          DEFAULT: '#1A1A1A', // Dark background
          light: '#2D2D2D',   // Lighter dark
          lighter: '#3D3D3D'  // Even lighter dark
        }
      }
    },
  },
  plugins: [],
}