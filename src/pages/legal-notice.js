import Link from "next/link";
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
      <Navigation title={"Digital Product Designer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full min-h-screen max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-lg font-semibold mb-12">Legal Notice</h1>
          <p className="mb-32">
            For the internet presence of: floriandwt.com Responsible for
            this websites is: Florian Kiem<br /><br />
            <span className="blur-sm">
              Thisis justa 4<br />
              12345 Placeholder<br />
            </span>
            <br /> Adress and phone number is blurred out because of privacy
            issues.
            <br /> <br /> Please write to <Link href="mailto:florian@designwithtech.com" className="inner-link">florian@designwithtech.com</Link> to get more
            specific information.
          </p>
          <h2 className="font-semibold mb-2">Copyright</h2>
          <p className="mb-32">
            The entire content of this portfolio website, including but not limited to text, graphics, images, logos, videos, and design elements, is intellectual property unless otherwise stated. It is protected by applicable copyright laws and international treaties. Unauthorized use or reproduction of the content on this website is only allowed for private use and otherwise strictly prohibited and may violate copyright laws.
          </p>
          <h2 className="font-semibold mb-2">No Warranty or Liability</h2>
          <p className="mb-32">
            The internal content provided on this portfolio website is for general informational purposes only. While Florian endeavors to provide accurate and up-to-date information, it makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the content.
            In no event shall Florian be liable for any loss or damage, including without limitation indirect or consequential loss or damage, or any loss or damage whatsoever arising from the use or reliance on the internal content of this website.          </p>
        </div>
        <div className="h-64"></div>
      </main>
      <Footer />
    </>
  );
}
