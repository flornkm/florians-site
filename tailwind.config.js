/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
    "./interface/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        lx: "1152px",
      },
    },
    fontFamily: {
      sans: ["Pretendard Variable", "Inter", "sans-serif"],
    },
  },
  plugins: [],
}
