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
        <title>{title} - Journal</title>
        <meta
          name="description"
          content="Designer and Developer building digital products."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={title + " - Journal"}
        />
        <meta
          property="og:description"
          content="Designer and Developer building digital products."
        />
        <meta
          property="og:image"
          content="/images/designwithtech_opengraph.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:title" content="Florian Portfolio" />
        <meta
          name="twitter:image"
          content="/images/designwithtech_twitter.jpg"
        />
        <meta
          name="twitter:description"
          content="Designer and Developer building digital products."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-transparent dark:text-white relative">
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
            <div className="flex gap-4 text-sm text-zinc-500 mb-2">{date}</div>
            <h1 className="text-3xl font-semibold text-left mb-6">{title}</h1>
            {text}
            <div className="h-6"></div>
            <small className="text-zinc-500 mb-10">
              <time>2023</time> - All used images belong to their respective
              owners and are used for demonstration purposes only.
            </small>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
