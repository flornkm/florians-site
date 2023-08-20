import Link from "next/link"
import Navigation from "@/components/interface/Navigation"
import Footer from "@/components/interface/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal Notice",
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function LegalNotice() {
  return (
    <>
      <Navigation title="Legal Notice" />
      <main className="max-md:w-[90%] w-full min-h-screen max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-16">
          <h1 className="text-lg font-semibold mb-12">Legal Notice</h1>
          <p className="mb-32">
            For the internet presence of: floriandwt.com Responsible for this
            websites is: Florian Kiem
            <br />
            <br />
            <span className="blur-sm">
              Thisis justa 4<br />
              12345 Placeholder
              <br />
            </span>
            <br /> Adress and phone number is blurred out because of privacy
            issues.
            <br /> <br /> Please write to{" "}
            <Link
              href="mailto:florian@designwithtech.com"
              className="inner-link"
            >
              florian@designwithtech.com
            </Link>{" "}
            to get more specific information.
          </p>
          <h2 className="font-semibold mb-2">Copyright</h2>
          <p className="mb-32">
            The entire content of this portfolio website, including but not
            limited to text, graphics, images, logos, videos, and design
            elements, is intellectual property unless otherwise stated. It is
            protected by applicable copyright laws and international treaties.
            Unauthorized use or reproduction of the content on this website is
            only allowed for private use and otherwise strictly prohibited and
            may violate copyright laws.
          </p>
          <h2 className="font-semibold mb-2">No Warranty or Liability</h2>
          <p className="mb-24">
            The internal content provided on this portfolio website is for
            general informational purposes only. While Florian endeavors to
            provide accurate and up-to-date information, it makes no
            representations or warranties of any kind, express or implied, about
            the completeness, accuracy, reliability, suitability, or
            availability of the content. In no event shall Florian be liable for
            any loss or damage, including without limitation indirect or
            consequential loss or damage, or any loss or damage whatsoever
            arising from the use or reliance on the internal content of this
            website.{" "}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
