const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        moveArrow: 'moveArrow 1s ease-in-out infinite',
      },
      keyframes: {
        moveArrow: {
          '0%, 100%': { transform: 'translateX(-16px)' },
          '50%': { transform: 'translateX(16px)' },
        }
      },
    },
    fontFamily: {
      sans: ['var(--pretendard-font)'],
      display: ['var(--kalam-font)'],
      mono: ['var(--jetbrains-mono-font)'],
    },
  },
  plugins: [],
}
