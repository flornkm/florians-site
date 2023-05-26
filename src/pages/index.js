import Head from "next/head";
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { NextSeo } from "next-seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import Image from "next/image";
import Link from "next/link";
import * as Icon from "react-feather";
import { useIsVisible } from "@/hooks/useIsVisible";
import copy from "copy-to-clipboard";

export default function Home() {
  const title = "Digital Product Designer";
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };
  const [highlight, setHighlight] = useState("Home");
  const projects = React.useRef(null);
  const contact = React.useRef(null);
  const [mailText, setMailText] = useState(["Florian", "Click to copy"]);
  const [mailActive, setMailActive] = useState(false);
  const isVisible = useIsVisible(projects);
  const contactVisible = useIsVisible(contact);

  useEffect(() => {
    if (isVisible) {
      setHighlight("Work");
    } else {
      setHighlight("Home");
    }
    if (contactVisible) {
      setMailActive(true);
    } else {
      setMailActive(false);
    }
  }, [isVisible, contactVisible]);

  const copyMail = () => {
    copy("florian.kiem@hfg.design");
    setMailText(["Copied", "Copied"]);
    setTimeout(() => {
      setMailText(["Florian", "Click to copy"]);
    }, 2000);
  };

  return (
    <>
      <NextSeo
        title="Florian - Digital Product Designer"
        description="Product Designer and Developer building digital experiences."
        openGraph={{
          url: 'floriandwt.com',
          title: 'Florian - Digital Product Designer',
          description: 'Product Designer and Developer building digital experiences.',
          images: [
            {
              url: '/images/designwithtech_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Digital Product Designer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Digital Product Designer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={title} highlight={highlight} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#101012] dark:text-white">
        <div className="md:min-h-[70vh] md:py-24 h-auto flex place-items-center justify-between max-md:flex-col max-md:justify-start max-md:place-items-start max-md:py-32 gap-16">
          <div className="md:w-[50%]">
            <h1 className="text-5xl font-semibold mb-6 leading-tight">
              Hey, I'm Florian
            </h1>
            <h2 className="text-3xl font-medium text-zinc-700 dark:text-zinc-400">
              A designer and developer building digital products.
            </h2>
            <div className="h-8 max-md:hidden"></div>
          </div>
          <Link
            className="p-4 shadow-lg active:shadow-none active:scale-95 w-full max-w-[400px] flex place-items-center ring-1 ring-zinc-200 gap-6 bg-zinc-50 transition-all hover:bg-zinc-100 hover:border-zinc-200 border-solid rounded-xl dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800 dark:hover:ring-zinc-700"
            href={"./#contact"}
          >
            <div className="h-[8px] w-[8px] flex-none flex justify-center place-items-center rounded-full bg-green-600 opacity-75 dark:bg-green-500">
              <div className="animate-ping h-[16px] w-[16px] absolute flex-none rounded-full bg-green-500 opacity-75"></div>
            </div>
            <p className="font-medium text-sm">
              Currently I am looking for internship opportunities in Europe or
              North America.
            </p>
          </Link>
        </div>
        <div>
          <h2 className="text-2xl font-medium text-black dark:text-white">
            As a designer and developer, I see my role in leading projects that help companies to achieve their ambitious goals of creating something functionally and technologically useful for humanity
          </h2>
        </div>
        <div className="h-64"></div>
        <div>
          <div className="flex justify-between pb-4">
            <h2 className="text-3xl font-semibold text-black dark:text-white">
              Some of my selected work
            </h2>
          </div>
          <div ref={projects} id="work">
            <div
              className={
                "flex flex-col gap-8"
              }
            >
              <Link
                href={"./projects/bridge"}
                className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
              >
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">

                  <Image
                    loader={imgLoader}
                    src="./images/bridge/bridge.webp"
                    alt="Image of the Bridge Landingpage in a Mockup"
                    className="w-full max-h-[272px] object-contain transition-all"
                    width={350}
                    height={250}
                  />
                </div>
                <div className="max-w-sm col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium pb-1">Bridge</h3>
                    <Icon.ChevronRight size={22} className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative" />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex gap-2 place-items-center">
                      <Icon.Calendar width={14} />
                      <p className="font-mono">Q1 2023 – <span className="text-green-500 font-sans font-medium">Now</span></p>
                    </div>
                  </div>
                  <p className="pb-2 text-zinc-600 dark:text-zinc-400">
                    Product that helps creating job pages in a matter of minutes
                  </p>
                </div>
              </Link>

              <Link
                href={"./projects/curations"}
                className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
              >
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">

                  <Image
                    loader={imgLoader}
                    src="./images/curations/curations.webp"
                    alt="Image of Curations in a Mockup"
                    className="w-full max-h-[272px] object-contain transition-all"
                    width={350}
                    height={250}
                  />
                </div>
                <div className="max-w-sm col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium pb-1">Curations</h3>
                    <Icon.ChevronRight size={22} className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative" />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex gap-2 place-items-center">
                      <Icon.Calendar width={14} />
                      <p className="font-mono">Q4 2022 – <span className="text-green-500 font-sans font-medium">Now</span></p>
                    </div>
                  </div>
                  <p className="pb-2 text-zinc-600 dark:text-zinc-400">
                    Website featuring useful curations for designers and
                    developers
                  </p>
                </div>
              </Link>

              <Link
                href={"./projects/boost"}
                className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
              >
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">

                  <Image
                    loader={imgLoader}
                    src="./images/boost/boost.webp"
                    alt="Photo of the Boost Device"
                    className="w-full max-h-[272px] object-contain transition-all"
                    width={350}
                    height={250}
                  />
                </div>
                <div className="max-w-sm col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium pb-1">Boost</h3>
                    <Icon.ChevronRight size={22} className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative" />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex gap-2 place-items-center">
                      <Icon.Calendar width={14} />
                      <p className="font-mono">Q1 2023</p>
                    </div>
                  </div>
                  <p className="pb-2 text-zinc-600 dark:text-zinc-400">
                    Mobile application and hardware device to calculate
                    nutrition intake and provide personalized nutrition
                  </p>
                </div>
              </Link>

              <Link
                href={"/projects/ambient-chat"}
                className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
              >
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">

                  <Image
                    loader={imgLoader}
                    src="./images/ambient_chat/ambient_chat.webp"
                    alt="Image of the Ambient Chat Platform"
                    className="w-full max-h-[272px] object-contain transition-all"
                    width={350}
                    height={250}
                  />
                </div>
                <div className="max-w-sm col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium pb-1">Ambient Chat</h3>
                    <Icon.ChevronRight size={22} className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative" />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex gap-2 place-items-center">
                      <Icon.Calendar width={14} />
                      <p className="font-mono">Q2 2022</p>
                    </div>
                  </div>
                  <p className="pb-2 text-zinc-600 dark:text-zinc-400">
                    Realtime chat application with artificial intelligence
                  </p>
                </div>
              </Link>

              <Link
                href={"/projects/homebility"}
                className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
              >
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">

                  <Image
                    loader={imgLoader}
                    src="./images/homebility/homebility.webp"
                    alt="Image of the Homebility Mobile App"
                    className="w-full max-h-[272px] object-contain transition-all"
                    width={350}
                    height={250}
                  />
                </div>
                <div className="max-w-sm col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-xl font-medium pb-1">Homebility</h3>
                    <Icon.ChevronRight size={22} className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative" />
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div className="flex gap-2 place-items-center">
                      <Icon.Calendar width={14} />
                      <p className="font-mono">Q2 2022</p>
                    </div>
                  </div>
                  <p className="pb-2 text-zinc-600 dark:text-zinc-400">
                    Accessible smarthome application with an easy to use
                    interface
                  </p>
                </div>
              </Link>

            </div>
          </div>
        </div>
        {/* <div className="h-64"></div>
        <div className="flex gap-8 justify-between max-md:flex-col ">
          <div className="md:max-w-[50%]">
            <h2 className="text-2xl font-semibold mb-4">More to my person</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Being interested in technology and design would be a big
              understatement. I love creating useful products, trying out new
              things and adjusting key levers as long as necessary to give
              people the best experience possible. <br />
              <br /> The reason for doing this, is because I see myself not only
              as a designer or engineer of a product, much more can I imagine
              myself as the end-user that wants to have an accessible product
              that's usable. <br />
              <br /> If you want to read more to myself, you can click the
              button below or find me on{" "}
              <Link
                href="https://read.cv/floriandwt"
                target={"_blank"}
                className="text-[#1281ed] opacity-100 inline-block font-medium rounded-md transition-opacity hover:opacity-80"
              >
                Read.cv
              </Link>
              .
            </p>
            <div className="h-8"></div>
            <Link
              className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-zinc-100 transition-all font-medium border border-solid border-zinc-300 dark:bg-transparent dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-700"
              href="./about"
            >
              About me
            </Link>
          </div>
          <Image
            loader={imgLoader}
            src="./images/photo_memoji.jpg"
            alt="Image of Florian as a student"
            className="w-full h-full max-md:order-first max-md:mb-8 max-w-[350px] max-h-[500px] object-cover group-hover:opacity-80 transition-all duration-100 ease-in-out rotate-3 md:hover:-rotate-3"
            width={250}
            height={600}
          />
        </div> */}
        <div className="h-64"></div>
        <div
          className={
            (mailActive
              ? "fixed right-0 bottom-8 z-40 pointer-events-none pr-[10%] opacity-100 max-md:hidden"
              : "opacity-0 pr-[10%] bottom-0") +
            " transition-all duration-300 max-md:hidden"
          }
        >
          <div className="max-w-6xl flex justify-end w-full">
            <div
              onClick={copyMail}
              className="pr-4 pl-4 pt-3 pb-3 group z-10 pointer-events-auto bg-white hover:bg-zinc-100 hover:scale-[0.99] shadow-lg dark:hover:bg-zinc-800 transition-all rounded-lg backdrop-blur-xl ring-1 ring-zinc-200 cursor-pointer flex gap-8 justify-between place-items-center dark:bg-zinc-900 dark:ring-zinc-700"
            >
              <div className="flex flex-col">
                <p className="font-semibold group-hover:hidden">
                  {mailText[0]}
                </p>
                <p className="font-semibold hidden group-hover:block">
                  {mailText[1]}
                </p>
                <p>florian.kiem@hfg.design</p>
              </div>
              <Icon.Mail width={24} />
            </div>
          </div>
        </div>
        <div ref={contact} id="contact">
          <Contact />
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
