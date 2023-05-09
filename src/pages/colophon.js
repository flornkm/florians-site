import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { NextSeo } from "next-seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import * as Icon from "react-feather";
import { PhosphorLogo } from "phosphor-react";

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
          <p className="text-base mb-24">
            A colophon describes the methods, tools, and materials used to make
            a creative work. On this site you'll therefore find information from
            where inspiration to specific contents came and which technologies I
            have used to create my space here on the internet.
          </p>
          {/* <h2 className="text-xl font-medium mb-8">General</h2> */}
          <div className="flex flex-col gap-8">
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">Typography</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
                <Link
                  className="font-medium transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://fonts.google.com/specimen/Plus+Jakarta+Sans"}
                  target="_blank"
                >
                  Plus Jakarta Sans
                </Link>
                <Link
                  className="font-medium font-display transition-all text-black border-b-black group pt-1 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://fonts.google.com/specimen/Kalam"}
                  target="_blank"
                >
                  Kalam
                </Link>
                <Link
                  className="font-medium font-mono transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://fonts.google.com/specimen/JetBrains+Mono"}
                  target="_blank"
                >
                  JetBrains Mono
                </Link>
              </div>
            </div>
            <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">Iconography</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://feathericons.com/"}
                  target="_blank"
                >
                  <Icon.Feather className="w-5 h-5 text-blue-500" />
                  Feather Icons
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://phosphoricons.com/"}
                  target="_blank"
                >
                  <PhosphorLogo className="w-5 h-5 text-rose-500" weight="fill" />
                  Phosphor (For filled icons)
                </Link>
              </div>
            </div>
            <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">Photography</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.alicesopp.com/"}
                  target="_blank"
                >
                  <Image
                    src="/images/people/alice_profile.jpg"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Alice Sopp
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.marcrufeis.de/"}
                  target="_blank"
                >
                  <Image
                    src="/images/people/marc_profile.jpg"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Marc Rufeis
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.nilseller.com/"}
                  target="_blank"
                >
                  <Image
                    src="/images/people/nils_profile.jpg"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Nils Eller
                </Link>
              </div>
            </div>
            <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">Technology</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.nextjs.org/"}
                  target="_blank"
                >
                  <svg aria-label="Next.js logomark" className="next-mark_root__wLeec" data-theme="light" height="16" role="img" viewBox="0 0 180 180" width="16"><mask height="180" id="mask0_408_134" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}width="180" x="0" y="0"><circle cx="90" cy="90" fill="black" r="90"></circle></mask><g mask="url(#mask0_408_134)"><circle cx="90" cy="90" data-circle="true" fill="black" r="90"></circle><path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_134)"></path><rect fill="url(#paint1_linear_408_134)" height="72" width="12" x="115" y="54"></rect></g><defs><linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_408_134" x1="109" x2="144.5" y1="116.5" y2="160.5"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></linearGradient><linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_408_134" x1="121" x2="120.799" y1="54" y2="106.875"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></linearGradient></defs></svg>
                NextJS
                </Link>
                <Link
                  className="font-medium flex truncate items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://tailwindcss.com/"}
                  target="_blank"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 54 33"><g clip-path="url(#prefix__clip0)"><path fill="#38bdf8" fill-rule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clip-rule="evenodd"/></g><defs><clipPath id="prefix__clip0"><path fill="#fff" d="M0 0h54v32.4H0z"/></clipPath></defs></svg>
                  Tailwind CSS
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.vercel.com/"}
                  target="_blank"
                >
                  <svg aria-label="Vercel logomark" height="14" role="img" style={{ width: "auto", overflow: "visible" }} viewBox="0 0 74 64"><path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" fill="currentColor"></path></svg>
                  Vercel
                </Link>
                <Link
                  className="font-medium flex items-center gap-1 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.formspree.io/"}
                  target="_blank"
                >
                  <svg className="text-red-500 scale-50 -mt-1" title="Formspree logo" style={{overflow: "visible"}} width="30" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 3a3 3 0 013-3h26a3 3 0 013 3v4.286a3 3 0 01-3 3H3a3 3 0 01-3-3V3zm0 12.857a3 3 0 013-3h26a3 3 0 013 3v4.286a3 3 0 01-3 3H3a3 3 0 01-3-3v-4.286zm3 9.857a3 3 0 00-3 3V33a3 3 0 003 3h12a3 3 0 003-3v-4.286a3 3 0 00-3-3H3z" fill="currentColor"></path></svg>
                  Formspree
                </Link>
              </div>
            </div>
            <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">Inspiration</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
              <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.eikedrescher.com/"}
                  target="_blank"
                >
                  <Image
                    src="https://unavatar.io/eikedrescher"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Eike Drescher
                </Link>
              <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.linusrogge.com/"}
                  target="_blank"
                >
                  <Image
                    src="https://unavatar.io/linusrogge"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Linus Rogge
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.marco.fyi/"}
                  target="_blank"
                >
                  <Image
                    src="https://unavatar.io/marcofyi"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Marco Cornacchia
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://samuelkraft.com/"}
                  target="_blank"
                >
                  <Image
                    src="https://unavatar.io/samuelkraft"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Samuel Kraft
                </Link>
              </div>
            </div>
            <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
            <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
              <h2 className="text-lg font-medium text-zinc-400">With the help of</h2>
              <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
              <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.antonstallboerger.com/"}
                  target="_blank"
                >
                  <Image
                    src="/images/people/anton_profile.jpg"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Anton Stallbörger
                </Link>
                <Link
                  className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
                  href={"https://www.nilseller.com/"}
                  target="_blank"
                >
                  <Image
                    src="/images/people/nils_profile.jpg"
                    alt="Photography"
                    width={48}
                    height={48}
                    className="rounded-full h-6 w-6"
                  />
                  Nils Eller
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="md:h-64 max-md:h-32"></div>
      </main>
      <Footer />
    </>
  );
}
