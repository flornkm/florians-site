/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./renderer/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
    "./interface/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      cursor: {
        draw: "url(/images/letter/edit.cur) 4 40, pointer",
      },
      screens: {
        xs: "300px",
        lx: "1152px",
      },
      maxWidth: {
        s: "300px",
      },
      colors: {
        "light-zinc": "rgb(252, 252, 252)",
      },
      boxShadow: {
        "nav-shadow":
          "0 10px 15px -3px rgb(0 0 0 / 0.02), 0 4px 6px -4px rgb(0 0 0 / 0.025)",
      },
      keyframes: {
        shake: {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
          "100%": { transform: "translateX(0)" },
        },
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        shake: "shake 0.1s ease-in-out",
        "infinite-scroll": "infinite-scroll 25s linear infinite",
      },
    },
    fontFamily: {
      sans: ["Pretendard Variable", "Inter", "sans-serif"],
      // mono: [
      //   "Fragment Mono",
      //   "ui-monospace",
      //   "SFMono-Regular",
      //   "Liberation Mono",
      //   "Courier New",
      //   "monospace",
      // ],
    },
  },
  plugins: ["tai"],
}
