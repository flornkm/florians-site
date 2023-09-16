/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
    "./layouts/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Pretendard Variable", "Inter", "sans-serif"],
    },
  },
  plugins: [],
}
