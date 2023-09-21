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
      boxShadow: {
        "nav-shadow":
          "0 10px 15px -3px rgb(0 0 0 / 0.02), 0 4px 6px -4px rgb(0 0 0 / 0.025)",
      },
      keyframes: {
        "particle-bottom-top": {
          "0%": {
            transform: "translateY(0)",
            opacity: "0",
          },
          "25%": {
            opacity: "1",
          },
          "50%": {
            transform: "translateY(-16px); translateX(4px)",
          },
          "75%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-40px)",
            opacity: "0",
          },
        },
      },
      animation: {
        "particle-bottom-top": "particle-bottom-top 1s ease-in-out infinite",
        "particle-bottom-top-slow":
          "particle-bottom-top 1.5s ease-in-out infinite",
      },
    },
    fontFamily: {
      sans: ["Pretendard Variable", "Inter", "sans-serif"],
    },
  },
  plugins: [],
}
