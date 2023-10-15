import { InlineInfo } from "../../interface/components/Inline"
import Tooltip from "../../interface/components/Tooltip"
import Crop from "~icons/eva/crop-outline"
import Music from "~icons/eva/speaker-outline"
import Movie from "~icons/eva/film-outline"
import Map from "~icons/eva/pin-outline"
import { PhotoSlider } from "../../interface/components/Slider"

export const documentProps = {
  title: "About Florian",
}

export default function Page() {
  const experience = [
    {
      company: "inlang",
      comapanyLink: "https://inlang.com/",
      from: "06 / 2023",
      to: "Now",
      slogan:
        "Building an ecosystem around globalization and being responsible for its marketplace.",
      jobTitle: "Design Engineer",
    },
    {
      company: "Metahype",
      comapanyLink: "https://meta-hype.com/",
      from: "12 / 2020",
      to: "06 / 2023",
      slogan:
        "Building digital products for other companies, ranging from websites to full-stack applications.",
      jobTitle: "Design Engineer",
    },
    {
      company: "Comondo",
      comapanyLink: "https://meta-hype.com/",
      from: "02 / 2020",
      to: "03 / 2021",
      slogan:
        "Leading the company-wide effort to create high quality website designs for clients.",
      jobTitle: "Web Design Lead",
    },
    {
      from: "08 / 2015",
      to: "02 / 2020",
      slogan:
        "Working as a freelance designer, video editor and motion graphics artist.",
      jobTitle: "Freelancer",
    },
  ]
  return (
    <div class="w-full">
      <section class="w-full lg:pt-24 pt-16 flex gap-12 lg:flex-row flex-col mb-24">
        <div class="max-w-[170px] w-full flex-shrink-0">
          <img
            src="/images/avatars/florian_student.webp"
            class="aspect-square rounded-full"
          />
        </div>
        <div class="flex-grow md:max-w-md">
          <h1 class="text-xl font-semibold mb-3">About Florian</h1>
          <p class="text-zinc-500 mb-4">
            Born on the 11th of January, 2001 in{" "}
            <InlineInfo>
              <>
                Southern Germany
                <Tooltip position="top" class="-translate-y-2">
                  Ravensburg, BW
                </Tooltip>
              </>
            </InlineInfo>{" "}
            I was part of the first generation getting adults in the age of
            computers, mobile phones and advanced technology.
          </p>
          <p class="text-zinc-500 mb-4">
            Quickly I got used to working with computers and in 2013, I began
            making money on the internet by selling my skills as a
            <InlineInfo>
              <>
                digital Designer
                <Tooltip position="top" class="-translate-y-2">
                  I also edited videos
                </Tooltip>
              </>
            </InlineInfo>
            .
          </p>
          <p class="text-zinc-500 mb-4">
            Now, {new Date().getFullYear() - 2013} years later, I have learned
            coding in addition, opening whole new possibilites for people and
            companies I work with. The job title I love using for this unique
            field is:
            <br />
            <span class="font-medium">Design Engineer</span>.
          </p>
        </div>
        <div class="max-w-s w-full flex-shrink-0 lg:ml-auto xs:grid xs:grid-cols-2">
          <div class="self-start mb-10 xs:mb-0">
            <h2 class="font-medium mb-3">Socials</h2>
            <ul class="space-y-2">
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  Read.cv
                </a>
              </li>
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div class="place-self-end self-start">
            <h2 class="font-medium mb-3">Contact</h2>
            <ul class="space-y-2">
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  class="text-zinc-400 hover:text-zinc-600 transition-colors font-medium cursor-alias"
                  href="https://x.com/floriandwt/"
                >
                  iMessage
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section class="w-full flex flex-col md:flex-row md:gap-12 mb-48">
        <div class="md:w-full md:max-w-[170px]">
          <h2 class="text-lg font-semibold md:sticky top-20 md:mb-0 mb-8">
            Education
          </h2>
        </div>
        <div class="py-0.5">
          {experience.map((item) => {
            return (
              <div>
                <div>
                  <div class="flex gap-2 mb-1 items-center">
                    <p>
                      Working as {item.jobTitle} {item.company && "at"}{" "}
                      <a
                        class="text-black hover:text-zinc-600 transition-colors font-medium cursor-alias"
                        href={item.comapanyLink}
                        target="_blank"
                      >
                        {item.company}
                      </a>
                    </p>
                  </div>
                  <p class="text-sm mb-4">
                    {item.from} -{" "}
                    {item.to !== "Now" ? (
                      item.to
                    ) : (
                      <span class="text-green-600">{item.to}</span>
                    )}
                  </p>
                  <p class="text-zinc-500">{item.slogan}</p>
                </div>
                {experience.indexOf(item) !== experience.length - 1 && (
                  <div class="border-b border-b-zinc-200 my-8" />
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-32">
        <h2 class="text-xl font-semibold text-center mb-24">
          In case you don't want to read through the boring stuff, I treat the
          <br class="hidden md:block" />
          following sections as something like a personal library.
        </h2>
        <div class="mb-16">
          <h3 class="text-lg font-semibold mb-2">
            <Map class="inline-block mb-1" /> Locations
          </h3>
          <p class="text-zinc-500 mb-6 max-w-lg">
            Locations I visited in my life. Hoping to see more of the world in
            the next years.
          </p>
          <div class="w-full bg-zinc-100 h-96"></div>
        </div>
        <div class="mb-16">
          <h3 class="text-lg font-semibold mb-2">
            <Crop class="inline-block mb-1" /> Photos
          </h3>
          <p class="text-zinc-500 mb-6 max-w-lg">
            Snapshots from different moments in my life. I am not a photographer
            by any means, so don't expect high quality images.
          </p>
          <PhotoSlider autoPlay buttons />
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="mb-16">
            <h3 class="text-lg font-semibold mb-2">
              <Music class="inline-block mb-1" /> Music
            </h3>
            <p class="text-zinc-500 mb-6 max-w-sm">
              Taste is always different and I hear everything. These songs are
              just some of my favourites.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
              <div>
                <div class="h-56 bg-zinc-100 mb-2 rounded-xl" />
              </div>
              <div>
                <div class="h-56 bg-zinc-100 mb-2 rounded-xl" />
              </div>
            </div>
          </div>
          <div class="mb-16">
            <h3 class="text-lg font-semibold mb-2">
              <Movie class="inline-block mb-1" /> Movies & Documentaries
            </h3>
            <p class="text-zinc-500 mb-6 max-w-sm">
              Just like music, I have a wide range of movies and documentaries I
              love watching.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
              <div>
                <div class="h-80 bg-zinc-100 mb-2" />
                <p class="text-sm text-zinc-400">Caption Nr 1</p>
              </div>
              <div>
                <div class="h-80 bg-zinc-100 mb-2" />
                <p class="text-sm text-zinc-400">Caption Nr 1</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
