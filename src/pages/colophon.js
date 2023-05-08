import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import * as Icon from "react-feather";

export default function Colophon() {
  return (
    <>
      <NextSeo
        title="Colophon - Florian"
        description="Colophon of Florian's website."
        openGraph={{
          url: 'floriandwt.com',
          title: 'About - Florian',
          description: 'Colophon of Florian\'s website.',
          images: [
            {
              url: '/images/designwithtech_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Digtital Product Designer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Digtital Product Designer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#101012] dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-3xl font-semibold text-left mb-3">Colophon</h1>
          <p className="text-base mb-10">
            A colophon describes the methods, tools, and materials used to make
            a creative work. On this site you'll therefore find information from
            where inspiration to specific contents came and which technologies I
            have used to create my space here on the internet.
          </p>
          <h2 className="text-xl font-medium mb-8">General</h2>
          <div className="flex flex-col gap-8">
            <div className="flex justify-between w-full flex-wrap gap-4">
              <h2 className="text-lg font-medium">Typography</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-2">
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://fonts.google.com/specimen/Plus+Jakarta+Sans"}
                  target="_blank"
                >
                  Plus Jakarta Sans
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
              </div>
            </div>
            <div className="h-[1px] bg-zinc-200 w-full mt-1 mb-1 dark:bg-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4">
              <h2 className="text-lg font-medium">Photography</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-2">
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"#"}
                  target="_blank"
                >
                  Alice Sopp
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://www.marcrufeis.de/"}
                  target="_blank"
                >
                  Marc Rufeis
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://www.nilseller.com/"}
                  target="_blank"
                >
                  Nils Eller
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link 
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://www.nilseller.com/"}
                  target="_blank"
                >
                  Anton Stallbörger
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
              </div>
            </div>
            <div className="h-[1px] bg-zinc-200 w-full mt-1 mb-1 dark:bg-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-2">
              <h2 className="text-lg font-medium">Tech Stack</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-2">
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://nextjs.org/"}
                  target="_blank"
                >
                  NextJS
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://tailwindcss.com/"}
                  target="_blank"
                >
                  TailwindCSS
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://vercel.com/"}
                  target="_blank"
                >
                  Vercel
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://formspree.io/"}
                  target="_blank"
                >
                  Formspree
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
              </div>
            </div>
            <div className="h-[1px] bg-zinc-200 w-full mt-1 mb-1 dark:bg-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4">
              <h2 className="text-lg font-medium">Inspiration</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-2">
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://linusrogge.com/"}
                  target="_blank"
                >
                  Linus Rogge
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://www.marco.fyi/"}
                  target="_blank"
                >
                  Marco Cornacchia
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
                <Link
                  className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                  href={"https://samuelkraft.com/"}
                  target="_blank"
                >
                  Samuel Kraft
                  <Icon.ArrowUpRight
                    size={20}
                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
