import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import * as Icon from "react-feather";

export default function Journal({ title, text, mainImage, date }) {
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  return (
    <>
      <Head>
        <title>{title} | Design With Tech</title>
        <meta
          name="description"
          content="Designer and Developer building digital products."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Combining Design and Technology | Design With Tech"
        />
        <meta
          property="og:description"
          content="Designer and Developer building digital products."
        />
        <meta
          property="og:image"
          content="./images/designwithtech_opengraph.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:title" content="Florian Portfolio" />
        <meta
          name="twitter:image"
          content="./images/designwithtech_twitter.jpg"
        />
        <meta
          name="twitter:description"
          content="Designer and Developer building digital products."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#080D14] dark:text-white relative">
        <div className="flex flex-col items-center justify-center h-full pt-24 max-md:pt-16 mb-6 w-full">
          <div className="max-w-xl">
            <Image
              loader={imgLoader}
              src={mainImage}
              alt="Journal Cover"
              width={1920}
              height={500}
              className="mb-10"
            />
            <div className="flex gap-4 text-sm text-gray-500 mb-2">{date}</div>
            <h1 className="text-3xl font-semibold text-left mb-6">{title}</h1>
            {text}
            <div className="h-6"></div>
            <small className="text-gray-500 mb-10">
              <time>2023</time> © Design With Tech.
            </small>
          </div>
        </div>
        <div className="fixed z-10 bottom-10 left-[50%] w-full flex justify-end bg-red max-w-6xl translate-x-[-50%] pr-[5%] pointer-events-none max-md:bottom-auto max-md:top-12 max-md:pr-[10%]">
          <Link
            href={"/journal"}
            className="bg-white bg-opacity-80 rounded-full backdrop-blur-xl p-2 pointer-events-auto ring-1 ring-gray-300 hover:bg-gray-50 transition-all dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-gray-900"
          >
            <Icon.CornerUpLeft size={32} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
