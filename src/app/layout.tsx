import "../styles/globals.css"
import "../styles/Home.module.css"
import "../styles/musicplayer.css"
import localFont from "@next/font/local"
import { Gaegu } from "@next/font/google"
import { JetBrains_Mono } from "@next/font/google"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next"

const Pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--pretendard-font",
})

const gaeguFont = Gaegu({
  weight: ["700"],
  display: "swap",
  subsets: ["latin"],
  variable: "--gaegu-font",
})

const jetBrainsMono = JetBrains_Mono({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--jetbrains-mono-font",
})

export const metadata: Metadata = {
  title: {
    default: "Florian - Design Engineer",
    template: "%s - Florian",
  },
  description: "Design Engineer building digital products and experiences.",
  openGraph: {
    title: "Florian - Design Engineer",
    description: "Design Engineer building digital products and experiences.",
    url: `https://floriankiem.com/`,
    siteName: "Florian - Design Engineer",
    images: [
      {
        url: `https://floriankiem.com/images/florian_opengraph.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Florian - Design Engineer",
    card: "summary_large_image",
    description: "Design Engineer building digital products and experiences.",
    images: [
      {
        url: `https://floriankiem.com/images/florian_opengraph.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    shortcut: `https://floriankiem.com/favicon.ico`,
  },
  verification: {
    google: "lwrwKGT1XNL2S8VMtYsBlV0rJSaxO9kUPlS_6CO1ndA",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={
        "transition-all duration-300 " +
        `${Pretendard.variable} font-sans ${gaeguFont.variable} font-display ${jetBrainsMono.variable} font-mono opacity-100`
      }
    >
      <body className="dark:bg-black selection:bg-blue-200 dark:selection:bg-[#172554]">
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
