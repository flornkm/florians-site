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
              <p className="dark:text-zinc-400 text-zinc-600">
                By far the biggest influence on me had my friends and family. I really think, that having the right people around you is the most
                important thing in life. I would not have the skills I have today, if it wasn't for them. Support is the one thing, but getting
                criticism and honest feedback is the other. This is what helped me the most.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/apple.com" width={24} height={24} alt="Apple Favicon" className="rounded-full" />
                <h2 className="text-lg font-medium">Apple</h2>
              </div>
              <p className="dark:text-zinc-400 text-zinc-600">
                Kind of obvious and I am sure that many people will say the same, but Apple has always been a huge inspiration for me.
                Not only in terms of design but more in terms of how they were able to create an ecosystem that is so unbelievably well
                thought through.
              </p>
            </div>
            {/* <div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/lego.com" width={24} height={24} alt="Lego Favicon" className="rounded-full" />
                <h2 className="text-lg font-medium">Lego</h2>
              </div>
              </div>
              <p className="dark:text-zinc-400 text-zinc-600">
                Of course, there is no way around Lego. I grew up with it and it was the first time I was able to create something on my own.
                As a child, I can remember always loved the feeling of freedom combined with creating something not just as art, but rather
                something that has a deeper meaning behind it.
              </p>
            </div> */}
            {/* <div>
            <div className="flex items-center gap-3 mb-2">
                <Image src="https://unavatar.io/youtube.com" width={24} height={24} alt="Tribto" className="rounded-full" />
                <h2 className="text-lg font-medium">Tribto</h2>
              </div>
              <p className="dark:text-zinc-400 text-zinc-600">
                The name of a Youtube channel showcasing what you can do with design. Nowadays, the designs are not relevant to what I do anymore,
                but I discovered the channel when I was 12. It influenced me to start designing. Sadly, the person behind the channel took his own
                life in 2014. I wanted to especially mention this because his legacy lives on and I am sure that he has influenced many people in
                the same way he influenced me.
              </p>
            </div> */}
          </div>
          <div className="h-24" />
          <p className="dark:text-zinc-400 text-zinc-600">
            More to come…
          </p>
        </div>
        <div className="md:h-32 max-md:h-24"></div>
      </main>
      <Footer />
    </>
  );
}
