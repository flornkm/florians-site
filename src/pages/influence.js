import Image from "next/image";
import { NextSeo } from "next-seo";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import * as Icon from "react-feather";

export default function Colophon() {
  return (
    <>
      <NextSeo
        title="Influence - Florian"
        description="What me influences and inspires."
        openGraph={{
          url: 'floriandwt.com',
          title: 'Influence - Florian',
          description: 'What me influences and inspires.',
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
      />
      <Navigation title={"Designer and Developer"} highlight={"Legal"} />
      <main className="max-md:w-[90%] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-black dark:text-white">
        <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16">
          <h1 className="text-3xl font-semibold text-left mb-3">Influence</h1>
          <p className="text-base mb-24">
            What has influenced you in what you do? What is inspiring you to this day? I will try to answer these questions for myself on this page.
          </p>
          <div className="flex flex-col gap-16">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Icon.Users size={20} />
                <h2 className="text-lg font-medium">Friends and Family</h2>
              </div>
              <p className="dark:text-zinc-300 text-zinc-600">
                By far the biggest influence on me had my friends and family. I really think, that having the right people around you is the most
                important thing in life. I would not have the skills I have today, if it wasn't for them. Support is the one thing, but getting
                criticism and honest feedback is the other. This is what helped me the most.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/twitter.com" width={24} height={24} alt="Tribto" className="rounded-full" />
                <h2 className="text-lg font-medium">Twitters Design and Development Community</h2>
              </div>
              <p className="dark:text-zinc-300 text-zinc-600">
                Twitter is a platform I am using constantly since my earliest days of the internet. I don't think that Twitter itself has influenced
                me very much (but of course the platform is providing a place to connect - so thanks for that!), but the people in the design and
                development community did. While almost all of Twitter except this community is a toxic place, these people are the opposite.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/apple.com" width={24} height={24} alt="Apple Favicon" className="rounded-full" />
                <h2 className="text-lg font-medium">Apple</h2>
              </div>
              <p className="dark:text-zinc-300 text-zinc-600">
                Kind of obvious and I am sure that many people will say the same, but Apple has always been a huge inspiration for me.
                Not only in terms of design but more in terms of how they were able to create an ecosystem that is so unbelievably well
                thought through.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/youtube.com" width={24} height={24} alt="Tribto" className="rounded-full" />
                <h2 className="text-lg font-medium">Youtube and Creators</h2>
              </div>
              <p className="dark:text-zinc-300 text-zinc-600">
                I want to mention Youtube here, because this platform gave me so much free knowledge. I know for sure, that I wouldn't have
                discovered design to be a thing, when this website wouldn't have been invented. Also, thanks to all the creators out there, who
                are sharing their knowledge and skills to others for free.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/youtube/tribto" width={24} height={24} alt="Tribto" className="rounded-full" />
                <h2 className="text-lg font-medium">Tribto</h2>
              </div>
              <p className="dark:text-zinc-300 text-zinc-600">
                Tribto was the Youtube channel of a guy in the earlier days of Youtube (around 2012). He was showcasing what you can create
                with design, as a 12 year old, I found this fascinating. While my career path has changed and the designs are not relevant
                for me, this person inspired me when I was young. Sadly he took his life in 2014, but his influence will lives on.
              </p>
            </div>
          </div>
        </div>
        <div className="md:h-32 max-md:h-24"></div>
      </main>
      <Footer />
    </>
  );
}
