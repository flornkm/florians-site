import { InlineInfo } from "../../interface/components/Inline"
import Tooltip from "../../interface/components/Tooltip"
import Experience from "~icons/eva/briefcase-outline"
import Camera from "~icons/eva/camera-outline"
import Music from "~icons/eva/speaker-outline"
import Movie from "~icons/eva/film-outline"
import Map from "~icons/eva/pin-outline"
import Check from "~icons/eva/checkmark-outline"
import { PhotoSlider } from "../../interface/components/Slider"
import Button from "../../interface/components/Button"

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

  const bucketList = [
    {
      name: "Visit New York City",
      checked: true,
    },
    {
      name: "Work in a Startup",
      checked: true,
    },
    {
      name: "Live in a city with > 1 mio. inhabitants",
      checked: true,
    },
    {
      name: "Reach an online audience from over 100,000 people",
      checked: true,
    },
    {
      name: "Live in the USA",
      checked: false,
    },
    {
      name: "Go to New Zealand & Antarctica",
      checked: false,
    },
    {
      name: "Found own startup",
      checked: false,
    },
  ]

  const tools = [
    {
      name: "Notion",
      icon: "/images/bridge/bridge-icon.svg",
    },
    {
      name: "VS Code",
      icon: "/images/bridge/bridge-icon.svg",
    },
    {
      name: "Figma",
      icon: "/images/bridge/bridge-icon.svg",
    },
    {
      name: "Expedia",
      icon: "/images/bridge/bridge-icon.svg",
    },
  ]

  return (
    <div class="w-full">
      <section class="w-full lg:pt-16 pt-16">
        <h1 class="text-3xl font-semibold mb-16 w-full">About Florian</h1>
        <div class="flex gap-12 lg:flex-row flex-col mb-24">
          <div class="max-w-[170px] w-full flex-shrink-0">
            <img
              src="/images/avatars/florian_student.webp"
              class="aspect-square rounded-full"
            />
          </div>
          <div class="flex-grow md:max-w-md">
            <h1 class="text-xl font-semibold mb-3">A few words to myself</h1>
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
              <ul class="space-y-2 -ml-1">
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
            </div>{" "}
            <div class="place-self-end self-start">
              <h2 class="font-medium mb-3">Contact</h2>
              <ul class="space-y-2 -ml-1">
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
        </div>
      </section>
      <section class="w-full flex flex-col md:flex-row md:gap-12 mb-40">
        <div class="md:w-full md:max-w-[170px]">
          <h2 class="text-lg font-semibold md:sticky md:top-20 md:mb-0 mb-8 relative group">
            Education
            <Experience class="absolute pointer-events-none top-1/2 -translate-y-1/2 -left-10 mb-1 p-0.5 rounded-md text-black bg-zinc-200/75 aspect-square h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex" />
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
                  <div class="border-b border-b-zinc-100 my-8" />
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-32">
        <h2 class="text-xl font-medium mb-16 text-zinc-400">
          In case you don't want to read through the boring stuff, I treat the
          <br class="hidden md:block" />
          following sections as something like a personal library.
        </h2>
        <div class="mb-20 flex flex-col items-start">
          <h3 class="text-lg font-semibold mb-4">Photos</h3>
          <PhotoSlider autoPlay buttons />
        </div>
        <div class="w-full flex justify-between gap-12 md:flex-row flex-col my-32">
          <div class="md:w-full w-full h-full">
            <h3 class="text-lg font-semibold mb-4">Tools I love using</h3>
            <div class="py-0.5">
              {tools.map((tool) => {
                return (
                  <div>
                    <div>
                      <div class="flex gap-3 items-center">
                        <img src={tool.icon} class="w-5 h-5" />
                        <p class="text-blacktransition-colors font-medium">
                          {tool.name}
                        </p>
                      </div>
                    </div>
                    {tools.indexOf(tool) !== tools.length - 1 && (
                      <div class="border-b border-b-zinc-100 my-3" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div class="md:w-full max-w-s">
            <h4 class="text-lg font-semibold mb-4">Bucket List</h4>
            <ul class="space-y-4 list-none">
              {bucketList.map((entry) => (
                <li
                  class={
                    "flex items-start gap-3 " +
                    (entry.checked
                      ? "line-through selection:bg-transparent selection:text-black"
                      : "")
                  }
                >
                  <div class="bg-zinc-100 border flex-shrink-0 cursor-pointer border-zinc-200 bg-gradient-to-tr rounded-md flex items-center justify-center w-6 h-6 relative">
                    {entry.checked && (
                      <Check class="absolute -right-1.5 -top-1 w-7 h-7 active:animate-shake" />
                    )}
                  </div>
                  {entry.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="mb-20 flex flex-col items-start">
            <h3 class="text-lg font-semibold mb-4">Music</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 w-full gap-8">
              <div>
                <div class="h-64 pt-20 hover:pt-0 md:px-8 px-4 hover:h-64 lg:hover:h-80 overflow-hidden bg-zinc-100 mb-2 transition-all hover:bg-zinc-200 cursor-pointer group flex items-center justify-center flex-col gap-4 lg:gap-8">
                  <img
                    src="/images/music-covers/enjoy_silence.jpg"
                    class="w-40 h-40 rounded-full aspect-square md:group-active:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent pointer-events-none"
                  />
                  <Button
                    type="secondary"
                    class="w-full group-hover:opacity-100 opacity-0 selection:bg-transparent"
                    link="https://open.spotify.com/album/13OoJ5Y23cdo8CDAiQwznb"
                  >
                    <p class="mx-auto selection:bg-transparent selection:text-black">
                      Spotify
                    </p>
                  </Button>
                </div>
                <a
                  href="https://en.wikipedia.org/wiki/Enjoy_the_Silence"
                  target="_blank"
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors"
                >
                  Cover image source
                </a>
              </div>
              <div>
                <div class="h-64 pt-20 hover:pt-0 md:px-8 px-4 hover:h-64 lg:hover:h-80 overflow-hidden bg-zinc-100 mb-2 transition-all hover:bg-zinc-200 cursor-pointer group flex items-center justify-center flex-col gap-4 lg:gap-8">
                  <img
                    src="/images/music-covers/serotonin_moonbeams.jpg"
                    class="w-40 h-40 rounded-full aspect-square md:group-active:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent pointer-events-none"
                  />
                  <Button
                    type="secondary"
                    class="w-full group-hover:opacity-100 opacity-0 selection:bg-transparent"
                    link="https://open.spotify.com/album/1UTc8WInycl4tVgJ1yODaO"
                  >
                    <p class="mx-auto selection:bg-transparent selection:text-black">
                      Spotify
                    </p>
                  </Button>
                </div>
                <a
                  href="https://www.stereogum.com/2205763/the-blessed-madonna-serotonin-moonbeams-feat-uffie/music/"
                  target="_blank"
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors"
                >
                  Cover image source
                </a>
              </div>
            </div>
          </div>
          <div class="mb-20 flex flex-col items-start">
            <h3 class="text-lg font-semibold mb-4">Movies and series</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 w-full gap-8">
              <div>
                <div class="bg-zinc-100 h-80 mb-2 bg-[url('/images/movies-series/interstellar.jpg')] bg-cover bg-top flex items-end overflow-hidden">
                  <div class="text-white font-medium pb-4 px-4 relative w-full bg-gradient-to-t from-black/75 to-transparent pt-32 flex xs:justify-between items-start xs:gap-0 gap-2 xs:items-end flex-col xs:flex-row">
                    <p class="leading-none">Interstellar</p>
                    <a
                      target="_blank"
                      href="https://www.netflix.com/"
                      class="cursor-alias text-sm px-3 py-0.5 bg-red-600 rounded-full transition-colors hover:bg-red-500"
                    >
                      Netflix
                    </a>
                  </div>
                </div>
                <a
                  href="https://www.stereogum.com/2205763/the-blessed-madonna-serotonin-moonbeams-feat-uffie/music/"
                  target="_blank"
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors"
                >
                  Cover image source
                </a>
              </div>
              <div>
                <div class="bg-zinc-100 h-80 mb-2 bg-[url('/images/movies-series/wecrashed.jpg')] bg-cover bg-top flex items-end overflow-hidden">
                  <div class="text-white font-medium pb-4 px-4 relative w-full bg-gradient-to-t from-black/75 to-transparent pt-32 flex xs:justify-between items-start xs:gap-0 gap-2 xs:items-end flex-col xs:flex-row">
                    <p class="leading-none">WeCrashed </p>
                    <a
                      target="_blank"
                      href="https://www.netflix.com/"
                      class="cursor-alias text-sm px-3 py-0.5 bg-black rounded-full transition-colors hover:bg-zinc-800"
                    >
                      Apple TV+
                    </a>
                  </div>
                </div>
                <a
                  href="https://www.vogue.co.uk%2Farts-and-lifestyle%2Farticle%2Fwecrashed-apple-tv&psig=AOvVaw1TmOHYBg5jLkyGFaFlWq5Y&ust=1697491485478000&source=images&cd=vfe&opi=89978449&ved=0CBQQ3YkBahcKEwjAmefZ_viBAxUAAAAAHQAAAAAQJA"
                  target="_blank"
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors"
                >
                  Cover image source
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
