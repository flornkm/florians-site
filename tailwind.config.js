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
        nav: "432px",
      },
      colors: {
        "light-neutral": "rgb(252, 252, 252)",
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
        "fade-up-gentle": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "shrink-in-height": {
          "0%": { height: "100%" },
          "50%": { height: "20%" },
          "100%": { height: "100%" },
        },
      },
      animation: {
        shake: "shake 0.1s ease-in-out",
        "infinite-scroll": "infinite-scroll 25s linear infinite",
        "fade-up-gentle": "fade-up-gentle 0.5s ease-out",
        "shrink-in-height-fast": "shrink-in-height 0.5s ease-in-out infinite",
        "shrink-in-height-slow": "shrink-in-height 2s ease-in-out infinite",
        "shrink-in-height-medium": "shrink-in-height 1s ease-in-out infinite",
      },
      fontFamily: {
        rounded: ["Arial Rounded", "sans-serif"],
      },
    },
    fontFamily: {
      sans: ["Pretendard Variable", "Pretendard", "Inter", "sans-serif"],
      mono: [
        "Commit Mono",
        "ui-monospace",
        "SFMono-Regular",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
  },
  plugins: ["tai"],
}
