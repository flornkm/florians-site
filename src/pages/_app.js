import "@/styles/globals.css";
import { Plus_Jakarta_Sans } from "@next/font/google";

// If loading a variable font, you don't need to specify the font weight
const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --pjs-font: ${plusJakartaSans.style.fontFamily};
          }
        `}
      </style>
      <Component {...pageProps} />
    </>
  );
}
