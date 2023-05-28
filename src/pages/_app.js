import "@/styles/globals.css";
import "@/styles/musicplayer.css";
import { useEffect } from "react";
import localFont from "@next/font/local";
import { Plus_Jakarta_Sans } from "@next/font/google";
import { Kalam } from "@next/font/google";
import { JetBrains_Mono } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";

const Pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/Pretendard/PretendardVariable.woff2',
      weight: '400 500 600 700',
      style: 'normal',
    }
  ],
})

const InstrumentSans = localFont({
  src: [
    {
      path: '../../public/fonts/Instrument/InstrumentSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-Italic[wdth,wght].woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-SemiBoldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Instrument/InstrumentSans-Italic.woff2',
      weight: '400',
      style: 'italic',
    }
  ],
});

const jakartaFont = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  subsets: ["latin"],
})

const kalamFont = Kalam({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.getItem("color-theme") === "dark" ||
      (!("color-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <>
      <style jsx global>
        {`
          :root {
            --pretendard-font: ${Pretendard.style.fontFamily};
            --kalam-font: ${kalamFont.style.fontFamily};
            --jetbrains-mono-font: ${jetBrainsMono.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
