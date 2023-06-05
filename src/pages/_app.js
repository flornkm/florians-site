import "@/styles/globals.css";
import "@/styles/musicplayer.css";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import localFont from "@next/font/local";
import Script from "next/script";
import { Kalam } from "@next/font/google";
import { JetBrains_Mono } from "@next/font/google";
import { Analytics } from "@vercel/analytics/react";

const Pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/Pretendard/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
      subsets: ['latin'],
      display: 'swap',
    }
  ],
  variable: '--pretendard-font',
});

const kalamFont = Kalam({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--kalam-font",
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--jetbrains-mono-font",
});

export default function App({ Component, pageProps }) {
  const [loaded, setLoaded] = useState(false);

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

    setLoaded(true);
  }, []);

  return (
    <>
      <div className={"transition-all duration-300 " + (loaded ? (`${Pretendard.variable} font-sans ${kalamFont.variable} font-display ${jetBrainsMono.variable} font-mono opacity-100`) : "opacity-0")}>
        <Component {...pageProps} />
        <Analytics />
      </div>
    </>
  );
}
