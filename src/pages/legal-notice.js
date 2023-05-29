import Head from "next/head";
import Navigation from "@/components/Navigation";
import { NextSeo } from "next-seo";
import Footer from "@/components/Footer";

export default function LegalNotice() {
  return (
    <>
      <NextSeo
        title="Legal Notice - Florian"
        description=""
        openGraph={{
          url: 'floriandwt.com',
          title: 'Legal Notice - Florian',
          description: '',
          images: [
            {
              url: '/images/florian_opengraph.jpg',
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
        nofollow={true}
      />
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-2xl font-semibold mb-2"> Legal Notice</h1>
          <p className="text-lg">
            For the internet presence of: floriandwt.com Responsible for
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
