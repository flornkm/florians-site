import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { Check, Expand } from "#design-system/Icons"
import { PhotoSlider } from "#components/Slider"
import Button, { InlineLink } from "#components/Button"
import * as m from "#lang/paraglide/messages"
import { Popup, usePopup } from "#components/Popup"
import NoPrerender from "#components/NoPrerender"
import "../../design-system/gradient-blur.css"

const experience = [
  {
    from: "02 / 2024",
    to: "Now",
    jobTitle: m.about_experience_tritschlerkiem_job(),
  },
  {
    company: "inlang",
    url: "https://inlang.com/",
    from: "06 / 2023",
    to: "01 / 2024",
    slogan: m.about_experience_inlang_slogan(),
    jobTitle: m.about_experience_inlang_job(),
  },
  {
    company: "Tritschler & Kiem GbR",
    url: "https://tritschlerkiem.com/",
    from: "12 / 2020",
    to: "06 / 2023",
    slogan: m.about_experience_tritschlerkiem_slogan(),
    jobTitle: m.about_experience_tritschlerkiem_job(),
  },
  {
    company: "Comondo",
    from: "02 / 2020",
    to: "03 / 2021",
    jobTitle: m.about_experience_comondo_job(),
  },
  {
    from: "08 / 2015",
    to: "02 / 2020",
    jobTitle: m.about_experience_freelancer_job(),
  },
]

const education = [
  {
    from: "10 / 2021",
    to: "Now",
    educationType: "Bachelor of Arts",
    school: "HfG Schwäbisch Gmünd",
    focus: "Digital Product Design and Development",
    url: "https://hfg-gmuend.de/",
  },
  {
    from: "09 / 2017",
    to: "07 / 2020",
    jobTitle: "High School Diploma",
    school: "Karl-Arnold-Schule",
    focus: "Media Design",
  },
]

const bucketList = [
  {
    name: m.bucketlist_nyc(),
    checked: true,
  },
  {
    name: "Visit San Francisco",
    checked: true,
  },
  {
    name: m.bucketlist_startup(),
    checked: true,
  },
  {
    name: m.bucketlist_city(),
    checked: true,
  },

  {
    name: m.bucketlist_usa(),
    checked: false,
  },
  {
    name: m.bucketlist_travel(),
    checked: false,
  },
  {
    name: m.bucketlist_found(),
    checked: false,
  },
]

const tools = [
  {
    name: "Notion",
    icon: "/images/apps/app_notion.jpg",
    link: "https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281",
  },
  {
    name: "Expedia",
    icon: "/images/apps/app_expedia.jpg",
    link: "https://apps.apple.com/us/app/expedia-hotels-flights-car/id427916203",
  },
  {
    name: "X (Twitter)",
    icon: "/images/apps/app_x.jpg",
    link: "https://apps.apple.com/de/app/x/id333903271",
  },
  {
    name: "Flighty",
    icon: "/images/apps/app_flighty.jpg",
    link: "https://apps.apple.com/us/app/flighty-live-flight-tracker/id1358823008",
  },
  {
    name: "Spotify",
    icon: "/images/apps/app_spotify.jpg",
    link: "https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580",
  },
  {
    name: "Finanzguru",
    icon: "/images/apps/app_finanzguru.jpg",
    link: "https://apps.apple.com/us/app/finanzguru-konten-vertr%C3%A4ge/id1214803607",
  },
  {
    name: "Messages",
    icon: "/images/apps/app_messages.jpg",
    link: "https://apps.apple.com/us/app/messages/id1146560473",
  },
  {
    name: "Cron",
    icon: "/images/apps/app_cron.jpg",
    link: "https://apps.apple.com/us/app/cron-calendar/id1607562761",
  },
]

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full flex flex-col lg:flex-row py-4 md:mb-4 mb-8 lg:mb-12">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8">
          <h1 class="text-2xl line-clamp-2 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group">
            {m.about_title()}
          </h1>
        </div>
        <div class="w-full lg:mx-auto">
          <div class="w-full h-40 rounded-2xl bg-neutral-100 max-w-nav relative bg-[url('/images/photos/netherlands.jpg')] bg-cover bg-center mx-auto lg:ml-0">
            <img
              src="/images/avatars/florian_student.webp"
              class="aspect-square rounded-full w-24 absolute -bottom-12 left-0 border-4 border-light-neutral dark:border-black"
              alt="Florian as a student"
            />
          </div>
        </div>
      </section>
      <section class="w-full flex flex-col lg:flex-row py-4 md:mb-8 mb-12">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8">
          <div />
        </div>
        <div class="lg:max-w-nav w-full lg:mx-auto">
          <div class="flex-grow mx-auto max-w-md">
            <p class="text-neutral-500 mb-4 dark:text-neutral-400">
              {m.about_explainer_text_born()}{" "}
              <InlineInfo>
                <>
                  {m.about_explainer_text_where()}
                  <Tooltip position="top" class="-translate-y-3">
                    {m.about_explainer_text_where_tooltip()}
                  </Tooltip>
                </>
              </InlineInfo>{" "}
              {m.about_explainer_text_generation()}
            </p>
            <p class="text-neutral-500 mb-4 dark:text-neutral-400">
              {m.about_explainer_text_start()}
              <InlineInfo>
                <>
                  {m.about_explainer_text_work()}
                  <Tooltip position="top" class="-translate-y-3">
                    {m.about_explainer_text_work_tooltip()}
                  </Tooltip>
                </>
              </InlineInfo>
              .
            </p>
            <p class="text-neutral-500 mb-4 dark:text-neutral-400">
              {m.about_explainer_text_now()} {new Date().getFullYear() - 2013}{" "}
              {m.about_explainer_text_later()}
              <br />
              <span class="font-medium">{m.design_engineer()}</span>.
            </p>
          </div>
          <div class="max-w-nav mx-auto">
            <h3 class="text-lg font-semibold mt-12 mb-4">
              {m.about_education_title()} & Experience
            </h3>
            <Experience />
            <Education />
          </div>
        </div>
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full lg:pl-8" />
      </section>
      <div class="relative lg:block hidden"></div>
      <div class="w-full overflow-hidden flex items-center justify-between lg:justify-center mb-12">
        <p class="text-[22vw] rotate-1 text-center flex tracking-tighter letter-rotate leading-none inset-0 bg-gradient-to-t from-neutral-100 to-neutral-200 text-transparent bg-clip-text dark:from-neutral-900 dark:to-neutral-800">
          Fu
        </p>
        <p class="text-[22vw] -rotate-3 text-center flex tracking-tighter letter-rotate leading-none inset-0 bg-gradient-to-t from-neutral-100 to-neutral-200 text-transparent bg-clip-text dark:from-neutral-900 dark:to-neutral-800">
          n
        </p>
        <p class="text-[22vw] ml-4 -rotate-6 text-center flex tracking-tighter letter-rotate leading-none inset-0 bg-gradient-to-t from-neutral-100 to-neutral-200 text-transparent bg-clip-text dark:from-neutral-900 dark:to-neutral-800">
          Ar
        </p>
        <p class="text-[22vw] rotate-3 text-center flex tracking-tighter letter-rotate leading-none inset-0 bg-gradient-to-t from-neutral-100 to-neutral-200 text-transparent bg-clip-text dark:from-neutral-900 dark:to-neutral-800">
          ea
        </p>
      </div>
      <section class="w-full flex flex-col items-center lg:max-w-none max-w-md mx-auto mb-8">
        <h3 class="text-lg font-semibold max-w-nav w-full relative z-10">
          {m.about_apps_title()}
        </h3>
        <div class="lg:w-5/12 w-full">
          <div class="flex items-center relative">
            <div class="gradient-blur pointer-events-none w-1/2 ml-auto z-10 -right-16 absolute inset-0 -mr-10 hidden lg:block">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div class="gradient-blur pointer-events-none z-10 w-1/2 -left-16 absolute inset-0 rotate-180 -ml-10 hidden lg:block">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div
              x-data="{}"
              x-init="$nextTick(() => {
        let ul = $refs.icons;
        ul.insertAdjacentHTML('afterend', ul.outerHTML);
        ul.nextSibling.setAttribute('aria-hidden', 'true');
    })"
              class="w-full inline-flex pt-12 pb-20 flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
            >
              <ul
                x-ref="icons"
                class="flex items-center justify-center md:justify-start [&_li]:mx-6 [&_img]:max-w-none animate-infinite-scroll"
              >
                {tools.map((tool) => {
                  return (
                    <li class="group relative flex-shrink-0">
                      <img
                        onClick={() =>
                          typeof window !== undefined &&
                          window.innerWidth > 768 &&
                          window.open(tool.link)
                        }
                        src={tool.icon}
                        alt={tool.name}
                        class="w-16 h-16 rounded-2xl border border-neutral-200 cursor-alias hover:shadow-lg hover:shadow-black/5 transition-all dark:border-neutral-800"
                      />
                      <Tooltip position="top" class="-translate-y-3.5 z-20">
                        {tool.name}
                      </Tooltip>
                    </li>
                  )
                })}
              </ul>
              <ul
                x-ref="icons"
                class="flex items-center justify-center md:justify-start [&_li]:mx-6 [&_img]:max-w-none animate-infinite-scroll"
              >
                {tools.map((tool) => {
                  return (
                    <li class="group relative flex-shrink-0">
                      <img
                        onClick={() =>
                          typeof window !== undefined &&
                          window.innerWidth > 768 &&
                          window.open(tool.link)
                        }
                        src={tool.icon}
                        alt={tool.name}
                        class="w-16 h-16 rounded-2xl border border-neutral-200 cursor-alias hover:shadow-lg hover:shadow-black/5 transition-all dark:border-neutral-800"
                      />
                      <Tooltip position="top" class="-translate-y-3.5 z-20">
                        {tool.name}
                      </Tooltip>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section class="w-full flex flex-col items-center lg:max-w-none max-w-md mx-auto mb-16 md:py-12 p-8 relative z-10">
        <h3 class="text-lg font-semibold max-w-nav w-full relative z-10 mb-12">
          Favorite meals
        </h3>
        <div class="w-full grid 2xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-16 lg:justify-center lg:flex-row max-w-4xl">
          <div class="flex flex-col items-center">
            <img
              src="/images/about/meals/healthy-chicken.webp"
              alt="Food"
              class="h-48 mb-8 mx-auto object-contain"
            />
            <h4 class="font-semibold mb-1">Healthy Chicken</h4>
            <p class="text-neutral-500 dark:text-neutral-400 font-mono">
              576 cal
            </p>
          </div>
          <div class="flex flex-col items-center">
            <img
              src="/images/about/meals/avocado-bread.webp"
              alt="Food"
              class="h-48 mb-8 mx-auto object-contain"
            />
            <h4 class="font-semibold mb-1">Avocado Bread</h4>
            <p class="text-neutral-500 dark:text-neutral-400 font-mono">
              432 cal
            </p>
          </div>
          <div class="flex flex-col items-center">
            <img
              src="/images/about/meals/tasty-ramen.webp"
              alt="Food"
              class="h-48 mb-8 mx-auto object-contain"
            />
            <h4 class="font-semibold mb-1">Tasty Ramen</h4>
            <p class="text-neutral-500 dark:text-neutral-400 font-mono">
              632 cal
            </p>
          </div>
        </div>
      </section>
      <section class="w-full flex flex-col items-center lg:max-w-none max-w-md mx-auto mb-16 md:py-12 p-8 relative z-10">
        <div class="w-full max-w-nav">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">Bucketlist</h3>
          <div class="grid 2xl:grid-cols-2 gap-8">
            <ul class="w-full">
              {bucketList
                .filter((item) => item.checked)
                .map((item) => {
                  return (
                    <li class="flex gap-2 mb-4 text-neutral-500 dark:text-neutral-400 items-center">
                      <Check class="w-3.5 h-3.5 flex-shrink-0 text-neutral-500 dark:text-neutral-400" />
                      <p>{item.name}</p>
                    </li>
                  )
                })}
            </ul>
            <ul class="w-full">
              {bucketList
                .filter((item) => !item.checked)
                .map((item) => {
                  return (
                    <li class="flex gap-2 mb-4 text-black dark:text-white">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="flex-shrink-0 text-black mt-1 dark:text-white"
                      >
                        <rect
                          x="0.75"
                          y="0.75"
                          width="14.5"
                          height="14.5"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                      </svg>
                      <p>{item.name}</p>
                    </li>
                  )
                })}
            </ul>
          </div>
        </div>
      </section>
      <section class="w-full flex gap-4 flex-col lg:flex-row py-4 lg:max-w-none max-w-md mx-auto mb-16 justify-center relative z-10">
        <div class="flex flex-col items-start lg:max-w-[calc(((100%-432px)/2)+432px)] relative lg:mb-0 mb-16">
          <h3 class="text-lg font-semibold mb-4 md:mb-4 lg:max-w-nav mx-auto w-full">
            {m.about_photos_title()}
          </h3>
          <PhotoSlider autoPlay buttons />
        </div>
      </section>
      <section class="w-full flex flex-col lg:flex-row lg:max-w-none max-w-md mx-auto mb-16 relative z-10">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full"></div>
        <div class="flex flex-col max-w-nav mr-auto"></div>
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full ml-auto"></div>
      </section>
      <section class="w-full flex flex-col gap-24 mx-auto mb-24">
        <div class="lg:max-w-nav w-full flex-shrink-0 mb-12 lg:mb-0 mx-auto relative z-10">
          <h3 class="text-lg font-semibold mb-4">Movies</h3>
          <div class="grid md:grid-cols-2 gap-8">
            <Movies
              movies={[
                {
                  title: "Interstellar",
                  cover: "/images/movies-series/interstellar.jpg",
                  url: "https://www.netflix.com/de-en/title/70305903",
                  provider: "Netflix",
                },
                {
                  title: "WeCrashed",
                  cover: "/images/movies-series/wecrashed.jpg",
                  url: "https://tv.apple.com/show/wecrashed/umc.cmc.6qw605uv2rwbzutk2p2fsgvq9?l=en-GB",
                  provider: "Apple TV+",
                },
              ]}
            />
          </div>
        </div>
        <div class="lg:max-w-nav w-full flex-shrink-0 lg:mb-0 mx-auto">
          <h3 class="text-lg font-semibold mb-4">Songs</h3>
          <div class="grid md:grid-cols-2 gap-8">
            <Music
              music={[
                {
                  name: "Enjoy the Silence",
                  cover: "/images/music-covers/enjoy_silence.jpg",
                  link: "https://open.spotify.com/album/13OoJ5Y23cdo8CDAiQwznb",
                  source: "https://en.wikipedia.org/wiki/Enjoy_the_Silence",
                },
                {
                  name: "Serotonin Moonbeams by The Blessed Madonna",
                  cover: "/images/music-covers/serotonin_moonbeams.jpg",
                  link: "https://open.spotify.com/album/1UTc8WInycl4tVgJ1yODaO",
                  source:
                    "https://www.stereogum.com/2205763/the-blessed-madonna-serotonin-moonbeams-feat-uffie/music/",
                },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

const Music = ({ music }: { music: Record<string, string>[] }) => {
  return (
    <>
      {music.map((song) => {
        return (
          <div class="mb-8 flex flex-col items-start w-full">
            <div class="flex items-center flex-col gap-4 w-full mb-[27px]">
              <img
                alt={song.name}
                src={song.cover}
                class="w-40 aspect-square mb-4 rounded-full active:cursor-progress md:hover:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent"
              />
              <Button type="text" class="w-full" link={song.link}>
                <p class="mx-auto selection:bg-transparent selection:text-black">
                  Spotify
                </p>
              </Button>
            </div>
            <a
              href={song.source}
              target="_blank"
              class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
            >
              {m.cover_image_source()}
            </a>
          </div>
        )
      })}
    </>
  )
}

const Movies = ({ movies }: { movies: Record<string, string>[] }) => {
  return (
    <>
      {movies.map((movie) => (
        <div class="w-full">
          <div
            style={{
              backgroundImage: `url(${movie.cover})`,
            }}
            class="bg-neutral-100 md:h-[233px] h-80 mb-3 bg-cover bg-top flex items-end overflow-hidden"
          >
            <div class="text-white truncate font-medium pb-3 px-4 relative w-full bg-gradient-to-t from-black/75 to-transparent pt-32 flex xs:justify-between items-start xs:gap-0 gap-2 xs:items-end flex-col xs:flex-row">
              <p class="leading-none mb-1 truncate">{movie.title}</p>
              {movie.provider === "Netflix" ? (
                <a
                  target="_blank"
                  href={movie.url}
                  class="cursor-alias text-sm px-3 py-0.5 bg-red-600 rounded-full transition-colors hover:bg-red-500"
                >
                  Netflix
                </a>
              ) : (
                <a
                  target="_blank"
                  href="https://www.netflix.com/"
                  class="cursor-alias text-sm px-3 py-0.5 bg-black rounded-full transition-colors hover:bg-neutral-800"
                >
                  Apple TV+
                </a>
              )}
            </div>
          </div>
          <a
            href={movie.url}
            target="_blank"
            class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
          >
            {m.cover_image_source()}
          </a>
        </div>
      ))}
    </>
  )
}

const Experience = () => {
  const {
    isOpen: experiencePopupOpen,
    openPopup: openExperiencePopup,
    closePopup: closeExperiencePopup,
    popup: experiencePopup,
  } = usePopup()

  return (
    <div class="max-w-nav w-full mb-16">
      <p class="text-neutral-500 mb-4 dark:text-neutral-400">
        Working as a {experience[0].jobTitle}
        {experience[0].company && `at ${experience[0].company}`}
        {experience[0].from && ` since ${experience[0].from}`}
        {experience[0].to && ` until ${experience[0].to}`}.
      </p>
      <p class="text-neutral-500 mb-8 dark:text-neutral-400">
        In the past, I worked at{" "}
        {experience
          .filter((item) => item.company)
          .map((item) => {
            return item.url ? (
              <InlineLink
                link={item.url}
                class="inline-block items-center gap-1 text-black mr-1.5"
                inlineImageUrl={
                  item.url
                    ? `https://api.microlink.io/?url=${item.url}&embed=logo.url`
                    : undefined
                }
              >
                {item.company}
                {experience.filter((item) => item.company).indexOf(item) !==
                experience.filter((item) => item.company).length - 1
                  ? ", "
                  : ""}
              </InlineLink>
            ) : (
              <span class="text-black font-medium mr-1.5">
                {item.company}
                {experience.filter((item) => item.company).indexOf(item) !==
                experience.filter((item) => item.company).length - 1
                  ? ", "
                  : "."}
              </span>
            )
          })}
      </p>
      <Button
        type="secondary"
        function={() => {
          openExperiencePopup()
        }}
      >
        <>
          Open Experience
          <Expand class="w-3 h-3 ml-1" />
        </>
      </Button>
      <NoPrerender>
        <Popup
          popup={experiencePopup}
          onClose={closeExperiencePopup}
          isOpen={experiencePopupOpen}
        >
          <div>
            <h3 class="text-lg font-semibold mb-8">Experience Sheet</h3>
            <div class="custom-scrollbar w-full overflow-x-scroll">
              <div class="overflow-hidden border border-neutral-200 rounded-xl dark:border-neutral-700">
                <table class="w-full border-spacing-1 table-auto rounded-xl border-collapse">
                  <thead class="h-10 text-neutral-900 bg-neutral-100 dark:text-white dark:bg-neutral-800">
                    <tr>
                      <th class="text-left font-medium px-4">Job</th>
                      <th class="text-left font-medium px-4">Time</th>
                      <th class="text-left font-medium px-4 max-lg:hidden">
                        Description
                      </th>
                    </tr>
                  </thead>
                  {experience.map((item) => {
                    return (
                      <tr>
                        <td class="h-14 px-4 rounded-lg border border-neutral-200 border-b-0 border-l-0 dark:border-neutral-700">
                          <a target="_blank" href={item.url ?? undefined}>
                            {item.jobTitle}{" "}
                            {item.company && m.about_education_at()}{" "}
                            {item.company}
                          </a>
                        </td>
                        <td class="text-sm mt-0.5 h-14 px-4 rounded-lg border border-neutral-200 border-b-0 dark:border-neutral-700">
                          <p class="line-clamp-2">
                            {item.from} -{" "}
                            {item.to !== m.about_education_now() ? (
                              item.to
                            ) : (
                              <span class="text-green-600">{item.to}</span>
                            )}
                          </p>
                        </td>
                        {item.slogan && (
                          <td class="text-neutral-500 h-14 px-4 rounded-lg max-w-md max-lg:hidden border border-neutral-200 border-r-0 dark:border-neutral-700">
                            <p class="line-clamp-2">{item.slogan}</p>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </table>
              </div>
            </div>
          </div>
        </Popup>
      </NoPrerender>
    </div>
  )
}

const Education = () => {
  const {
    isOpen: educationPopupOpen,
    openPopup: openEducationPopup,
    closePopup: closeEducationPopup,
    popup: educationPopup,
  } = usePopup()

  return (
    <div class="lg:max-w-nav w-full">
      <p class="text-neutral-500 mb-4 dark:text-neutral-400">
        Studying at{" "}
        <InlineLink
          link={education[0].url}
          class="inline-block items-center gap-1 text-black mr-1.5"
          inlineImageUrl={
            education[0].url
              ? `https://api.microlink.io/?url=${education[0].url}&embed=logo.url`
              : undefined
          }
        >
          {education[0].school}
        </InlineLink>
        since {education[0].from} in {education[0].focus}.
      </p>
      <p class="text-neutral-500 mb-8 dark:text-neutral-400">
        Previously, I attended{" "}
        {education.map(
          (item) =>
            education.indexOf(item) !== 0 &&
            (item.url ? (
              <InlineLink
                link={item.url}
                inlineImageUrl={
                  item.url
                    ? `https://api.microlink.io/?url=${item.url}&embed=logo.url`
                    : undefined
                }
              >
                {item.school}
                {education.indexOf(item) !== education.length - 1 ? ", " : "."}
              </InlineLink>
            ) : (
              <span>
                {item.school} from {item.from} to {item.to} in {item.focus}
                {education.indexOf(item) !== education.length - 1 ? ", " : "."}
              </span>
            ))
        )}
      </p>
      <Button
        type="secondary"
        function={() => {
          openEducationPopup()
        }}
      >
        <>
          Open Education
          <Expand class="w-3 h-3 ml-1" />
        </>
      </Button>
      <NoPrerender>
        <Popup
          popup={educationPopup}
          onClose={closeEducationPopup}
          isOpen={educationPopupOpen}
        >
          <div>
            <h3 class="text-lg font-semibold mb-8">Education Sheet</h3>
            <div class="custom-scrollbar w-full overflow-x-scroll">
              <div class="overflow-hidden border border-neutral-200 rounded-xl dark:border-neutral-700">
                <table class="w-full border-spacing-1 table-auto rounded-xl border-collapse">
                  <thead class="h-10 text-neutral-900 bg-neutral-100 dark:bg-neutral-800 dark:text-white">
                    <tr>
                      <th class="text-left font-medium px-4">Education</th>
                      <th class="text-left font-medium px-4">Time</th>
                      <th class="text-left font-medium px-4 max-lg:hidden">
                        Focus
                      </th>
                    </tr>
                  </thead>
                  {education.map((item) => {
                    return (
                      <tr>
                        <td class="h-14 px-4 rounded-lg border border-neutral-200 border-b-0 border-l-0 dark:border-neutral-700">
                          <a target="_blank" href={item.url ?? undefined}>
                            {item.educationType}{" "}
                            {item.school && m.about_education_at()}{" "}
                            {item.school}
                          </a>
                        </td>
                        <td class="text-sm mt-0.5 h-14 px-4 rounded-lg border border-neutral-200 border-b-0 dark:border-neutral-700">
                          <p
                            class="line-clamp
                          -2"
                          >
                            {item.from} -{" "}
                            {item.to !== m.about_education_now() ? (
                              item.to
                            ) : (
                              <span
                                class="text-green
                              -600"
                              >
                                {item.to}
                              </span>
                            )}
                          </p>
                        </td>
                        <td class="text-neutral-500 h-14 px-4 rounded-lg max-w-md max-lg:hidden border border-neutral-200 border-r-0 border-b-0 dark:border-neutral-700">
                          <p
                            class="line-clamp
                          -2"
                          >
                            {item.focus}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </table>
              </div>
            </div>
          </div>
        </Popup>
      </NoPrerender>
    </div>
  )
}

const Signature = () => (
  <svg
    width="96"
    class="mb-8"
    height="96"
    viewBox="0 0 123 75"
    fill="none"
    className="w-24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M37.7585 5.09938L37.7554 5.11918C36.7844 11.2539 33.851 17.2225 31.2081 22.5999C30.8174 23.3947 30.4331 24.1766 30.0625 24.9442C26.5815 32.153 22.872 39.2408 19.0122 46.2406C23.0778 42.5467 27.3044 39.0513 31.5001 35.5815C32.4608 34.787 33.4199 33.9938 34.3751 33.1999C34.4805 33.1122 34.6746 32.9211 34.96 32.6355L34.9999 32.5956C35.2413 32.354 35.5355 32.0595 35.7808 31.8436C35.8945 31.7435 36.0851 31.581 36.2977 31.4599L36.2993 31.459C36.3754 31.4156 36.6562 31.2556 37.0389 31.2337C37.2636 31.2209 37.6116 31.2514 37.9583 31.4726C38.3195 31.7032 38.5094 32.0319 38.5959 32.3028C38.7338 32.7349 38.6426 33.1103 38.6197 33.2046L38.6187 33.2086C38.5814 33.3628 38.5281 33.5027 38.4831 33.6099C38.3909 33.8297 38.2582 34.0881 38.0977 34.3769C35.7624 38.5806 33.6833 43.0985 32.1156 47.6193C31.3886 49.7156 30.7448 51.8848 30.558 53.9392C30.5471 54.0592 30.5353 54.1775 30.5236 54.2952C30.4925 54.6083 30.4618 54.9171 30.4488 55.2416C30.4373 55.5315 30.446 55.7433 30.4623 55.8865C30.5413 55.9105 30.6545 55.9366 30.8077 55.9574C31.3347 56.0288 31.9485 55.9914 32.3723 55.9603C35.0116 55.7666 37.4729 54.3849 39.8945 52.6892C40.7814 51.6589 41.7351 50.6868 42.7168 49.7618C43.1972 49.0683 43.6958 48.4233 44.1589 47.8291C46.3528 45.0147 48.9531 42.4602 51.8315 40.335C53.2535 39.2851 55.052 38.037 57.1905 37.6231C57.2959 37.6027 57.5053 37.566 57.7428 37.5834C57.8577 37.5919 58.1042 37.6202 58.3732 37.7626C58.69 37.9302 59.0366 38.2632 59.1517 38.7821C59.2505 39.227 59.125 39.581 59.0565 39.7369C58.9814 39.9082 58.8907 40.0318 58.8392 40.0971C58.7346 40.2297 58.6245 40.3293 58.5672 40.3796C58.4466 40.4854 58.3078 40.5881 58.2318 40.6444L58.2245 40.6498C58.165 40.6938 58.1368 40.7153 58.1277 40.7219C57.583 41.2317 57.0377 41.7464 56.4912 42.2642C56.5568 42.3119 56.6192 42.36 56.6785 42.4076C56.8557 42.5502 57.032 42.7123 57.1636 42.8333C57.1921 42.8596 57.2185 42.8839 57.2424 42.9057C57.3986 43.0479 57.5081 43.1408 57.6115 43.2121C57.6417 43.2329 57.673 43.2545 57.7053 43.2767C58.1398 43.5756 58.7539 43.9982 59.3003 44.4936C59.8684 45.0086 60.5477 45.7615 60.8141 46.7472C61.1452 47.9724 60.8794 49.1216 60.4374 50.0459C59.9995 50.9615 59.3517 51.7418 58.7506 52.3318C56.4172 54.6224 53.325 56.3668 50.0733 57.2996C55.8764 57.6606 61.7461 57.6216 67.6327 57.5825C69.6544 57.5691 71.6782 57.5557 73.7019 57.5585C76.9782 57.5629 80.2762 57.5325 83.5863 57.502C92.2423 57.4222 100.982 57.3416 109.639 57.8818C113.097 58.0976 116.692 58.3946 120.173 58.9211C120.586 58.9836 120.942 59.0459 121.196 59.1188C121.266 59.1389 121.36 59.1685 121.46 59.2115C121.535 59.2434 121.74 59.334 121.94 59.52C122.154 59.718 122.588 60.2677 122.377 61.0401C122.217 61.6281 121.776 61.8966 121.688 61.9505L121.687 61.9507C121.449 62.0958 121.202 62.1556 121.134 62.172L121.126 62.1738C121.015 62.201 120.897 62.2232 120.798 62.2407C120.707 62.2569 120.607 62.2735 120.511 62.2892L120.477 62.2949C120.367 62.3131 120.258 62.3312 120.148 62.3508C112.286 63.7578 104.12 63.8127 96.2146 63.8658C94.109 63.8799 92.0218 63.8939 89.9636 63.9334C75.6918 64.2066 61.4232 64.6028 47.1842 65.3627C42.3689 65.6197 37.8758 66.6328 33.1075 67.7078C32.363 67.8757 31.6118 68.0451 30.8516 68.2133C30.2465 68.3472 29.6324 68.4876 29.0104 68.6298C25.3528 69.466 21.4265 70.3636 17.4967 70.3636C16.6683 70.3636 15.9967 69.692 15.9967 68.8636C15.9967 68.0351 16.6683 67.3636 17.4967 67.3636C21.0588 67.3636 24.6102 66.5544 28.2838 65.7173C28.9198 65.5724 29.5594 65.4267 30.2034 65.2842C30.9432 65.1204 31.682 64.9536 32.421 64.7868C37.1746 63.7136 41.9363 62.6386 47.0244 62.367C61.3123 61.6045 75.6193 61.2075 89.9062 60.9339C92.0497 60.8929 94.194 60.8781 96.335 60.8633C99.6259 60.8406 102.909 60.8179 106.17 60.7001C98.7141 60.3632 91.2319 60.4322 83.7178 60.5015C80.3843 60.5322 77.0444 60.563 73.6978 60.5585C71.7296 60.5558 69.7431 60.5692 67.7446 60.5826C59.781 60.6363 51.6248 60.6913 43.6574 59.736C41.8831 59.5233 40.2761 59.0887 38.6875 58.6164C38.2377 58.4827 37.742 58.1688 37.4877 57.6034C35.967 58.3108 34.3313 58.8246 32.5919 58.9523L32.5895 58.9525C32.1806 58.9825 31.2786 59.0487 30.4046 58.9302C29.9671 58.8709 29.4396 58.7539 28.9521 58.4989C28.4465 58.2345 27.9021 57.7736 27.6518 57.0228C27.4363 56.3761 27.4302 55.6499 27.4512 55.1223C27.4681 54.6994 27.5123 54.2563 27.5451 53.9268C27.5549 53.8293 27.5636 53.7418 27.5703 53.6676C27.7917 51.2328 28.5383 48.7785 29.2812 46.6364C30.2217 43.924 31.336 41.2213 32.5724 38.588C27.4966 42.7877 22.4807 46.9692 17.7683 51.5085C17.6936 51.5806 17.6189 51.6528 17.5443 51.7251C18.7401 51.7732 19.9218 51.9839 21.0025 52.3335C21.2638 52.4181 21.553 52.5328 21.8123 52.7027C22.0486 52.8576 22.4759 53.2003 22.6185 53.812C22.776 54.488 22.4841 55.0152 22.2703 55.2824C22.067 55.5365 21.8259 55.7047 21.6728 55.8016C21.357 56.0016 20.9726 56.1672 20.7117 56.2782C20.6473 56.3056 20.5881 56.3306 20.5334 56.3537C20.3146 56.4463 20.1683 56.5081 20.0579 56.5655C19.9772 56.6075 19.8959 56.6498 19.8141 56.6924C18.1681 57.5494 16.3099 58.5169 14.3564 59.0972C13.7362 59.2814 12.6573 59.5621 11.5715 59.5926C11.5254 59.5939 11.478 59.5947 11.4293 59.5951C10.4872 61.2123 9.53967 62.8258 8.58762 64.436C8.04831 65.3482 7.50865 66.2935 6.961 67.2527C5.64694 69.5545 4.2869 71.9368 2.77545 74.1353C2.30612 74.8179 1.37225 74.9909 0.689592 74.5215C0.00693369 74.0522 -0.166005 73.1183 0.303323 72.4357C1.74071 70.3449 2.99895 68.1405 4.28462 65.8879C4.84713 64.9024 5.4149 63.9076 6.00521 62.9092C6.85324 61.4749 7.69739 60.0385 8.53697 58.5998C8.3806 58.4441 8.23589 58.2649 8.1072 58.0591C7.44421 56.9983 7.38193 55.6115 7.39913 54.61C7.40849 54.0645 7.44686 53.5251 7.48245 53.0582C7.48714 52.9966 7.49174 52.9368 7.49621 52.8786C7.52725 52.475 7.55211 52.1515 7.55931 51.8833C7.71585 46.0525 9.33667 40.3946 11.0374 35.0817C13.5571 27.2104 17.2297 19.5957 21.7772 12.6998C23.8374 9.57569 26.1703 6.5013 28.8984 3.81573C30.1825 2.55162 31.9002 1.00442 34.1084 0.440649C34.825 0.257687 35.6073 0.183383 36.328 0.458167C37.1471 0.77051 37.5964 1.41554 37.7967 2.055C37.9758 2.62718 37.972 3.22739 37.9388 3.69573C37.9049 4.17453 37.8254 4.67688 37.7585 5.09938ZM10.412 55.3688C10.3992 55.1616 10.3941 54.9264 10.3987 54.6615C10.4064 54.212 10.4385 53.7495 10.4738 53.2862C10.4781 53.2291 10.4826 53.1714 10.4871 53.1133C10.5173 52.7221 10.5488 52.3134 10.5582 51.9638C10.7023 46.5955 12.1994 41.2917 13.8946 35.9963C16.329 28.3913 19.8815 21.024 24.2817 14.3514C26.2723 11.3328 28.4748 8.44243 31.003 5.95365C32.2775 4.69902 33.4947 3.69355 34.8505 3.3474C34.8878 3.33788 34.9225 3.32962 34.9548 3.32248C34.9532 3.37197 34.9504 3.4257 34.9463 3.48391C34.9227 3.8175 34.8641 4.19624 34.7923 4.6502C33.898 10.3005 31.1914 15.8184 28.5328 21.2384C28.1391 22.0409 27.7465 22.8413 27.361 23.6397C22.1485 34.4342 16.4125 44.9697 10.412 55.3688ZM13.3594 56.2628C13.4085 56.2489 13.4561 56.235 13.5022 56.2213C14.7066 55.8636 15.889 55.3235 17.0992 54.7149C16.2895 54.7085 15.4875 54.8002 14.7478 54.9979C14.7408 55.0021 14.7328 55.007 14.7239 55.0126C14.6491 55.0592 14.6183 55.08 14.5798 55.1059C14.541 55.1321 14.4945 55.1635 14.3871 55.232C14.3205 55.2745 14.2302 55.3305 14.1323 55.3825C14.0702 55.4155 13.9434 55.4811 13.779 55.533C13.6392 55.7764 13.4994 56.0196 13.3594 56.2628ZM14.793 54.972C14.793 54.9721 14.7916 54.9728 14.7891 54.9741C14.7918 54.9726 14.793 54.972 14.793 54.972ZM20.0799 53.2589C20.08 53.259 20.077 53.2611 20.0704 53.2654C20.0764 53.2609 20.0798 53.2588 20.0799 53.2589ZM35.7235 32.4322C35.7237 32.4318 35.7234 32.4326 35.7226 32.4347C35.7231 32.4333 35.7234 32.4325 35.7235 32.4322ZM44.0526 53.3545C43.8554 53.7573 43.6885 54.1648 43.5593 54.5801C43.5092 54.7411 43.486 54.8574 43.4755 54.9366C43.5489 54.9584 43.6562 54.9833 43.8074 55.0045C44.1078 55.0466 44.4824 55.0615 44.939 55.0591C49.0915 55.0376 53.6477 53.1372 56.649 50.1909C57.0964 49.7517 57.4925 49.2502 57.7309 48.7516C57.9653 48.2615 58.0083 47.864 57.918 47.5299C57.8775 47.3802 57.7137 47.1045 57.2853 46.7161C56.8933 46.3607 56.4325 46.0431 55.9699 45.7242L55.9083 45.6817C55.6298 45.4897 55.3969 45.2827 55.2219 45.1232C55.1758 45.0812 55.1347 45.0435 55.0973 45.0092C54.9745 44.8965 54.891 44.8198 54.7984 44.7454C54.6183 44.6006 54.5687 44.6008 54.5227 44.6011C54.5208 44.6011 54.5188 44.6011 54.5169 44.6011C54.3343 44.6011 54.1523 44.62 53.9692 44.6574C50.8015 47.6566 47.5486 50.6681 44.0526 53.3545ZM57.7605 40.5684C57.7733 40.566 57.7706 40.5672 57.7553 40.5695C57.757 40.5691 57.7588 40.5688 57.7605 40.5684ZM120.414 59.2596C120.412 59.2601 120.409 59.2608 120.405 59.2616C120.434 59.2529 120.441 59.2531 120.414 59.2596Z"
      fill="currentColor"
    ></path>
  </svg>
)
