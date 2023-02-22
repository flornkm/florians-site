import Head from "next/head";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LegalNotice() {
  return (
    <>
      <Head>
        <title>Legal Notice | Design With Tech</title>
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
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#080D14] dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-2xl font-semibold mb-2"> Legal Notice</h1>
          <p className="text-lg">
            For the internet presence of: designwithtech.com Responsible for
            this websites is: Florian Kiem
            <br /> Adress and phone number is blurred out because of privacy
            issues.
            <br /> <br /> Please write to florian@designwithtech.com to get more
            specific information.
          </p>
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
