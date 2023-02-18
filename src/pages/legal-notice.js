import Head from "next/head";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LegalNotice() {
  return (
    <>
      <Head>
        <title>Legal Notice | Design With Tech</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-2xl font-bold mb-2"> Legal Notice</h1>
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