import "@/styles/globals.css";
import "@/styles/musicplayer.css";
import { Plus_Jakarta_Sans } from "@next/font/google";
import { Kalam } from "@next/font/google";

// If loading a variable font, you don't need to specify the font weight
const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const kalamFont = Kalam({
  weight: ['400'],
  style: ["normal"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --pjs-font: ${plusJakartaSans.style.fontFamily};
            --kalam-font: ${kalamFont.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
