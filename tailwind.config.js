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
        xs: "340px",
        lx: "1152px",
      },
      maxWidth: {
        s: "288px",
      },
      colors: {
        "light-zinc": "rgb(252, 252, 252)",
      },
      boxShadow: {
        "nav-shadow":
          "0 10px 15px -3px rgb(0 0 0 / 0.02), 0 4px 6px -4px rgb(0 0 0 / 0.025)",
      },
    },
    fontFamily: {
      sans: ["Pretendard Variable", "Inter", "sans-serif"],
    },
  },
  plugins: ["tai"],
}
