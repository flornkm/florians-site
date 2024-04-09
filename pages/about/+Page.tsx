import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { Expand } from "#design-system/Icons"
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
      <section class="w-full flex flex-col lg:flex-row py-4 md:mb-4 mb-12">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8">
          <h1 class="text-2xl line-clamp-2 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group">
            {m.about_title()}
          </h1>
        </div>
        <div class="w-full lg:mx-auto">
          <div class="w-full h-40 rounded-2xl bg-neutral-100 max-w-nav relative bg-[url('/images/photos/netherlands.jpg')] bg-cover bg-center mb-8">
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
        </div>
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full lg:pl-8">
          <Experience />
          <Education />
        </div>
      </section>
      <section class="w-full flex gap-4 flex-col lg:flex-row py-4 lg:max-w-none max-w-md mx-auto mb-16 lg:mb-0">
        <div class="flex flex-col lg:py-24 items-start lg:max-w-[calc(((100%-432px)/2)+432px)] lg:pr-2 relative">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">
            {m.about_photos_title()}
          </h3>
          <PhotoSlider autoPlay buttons />
        </div>
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full flex-shrink-0 lg:mt-24 lg:pl-8">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">Bucketlist</h3>
          <div class="grid 2xl:grid-cols-2 gap-4">
            <ul class="w-full">
              {bucketList
                .filter((item) => item.checked)
                .map((item) => {
                  return (
                    <li class="flex gap-4 font-mono mb-4 text-neutral-500 dark:text-neutral-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="flex-shrink-0 text-neutral-400 dark:text-neutral-500 mt-1"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4 8.66602L5.84162 13.666H7.75373L12.0721 2H10.0526L6.87287 11.2598H6.74396L5.8533 8.66602H4Z"
                          fill="currentColor"
                        />
                      </svg>
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
                    <li class="flex gap-2 font-mono mb-4 text-black dark:text-white">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="flex-shrink-0 text-black mt-1"
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
      <section class="w-full flex gap-4 flex-col lg:flex-row py-4 lg:max-w-none max-w-md mx-auto h-80">
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full flex-shrink-0 lg:mt-20">
          <h3 class="text-lg font-semibold md:mb-0 -mb-8 relative z-10">
            {m.about_apps_title()}
          </h3>
        </div>
        <div class="lg:w-7/12">
          <div class="flex items-center relative py-8">
            <div class="gradient-blur pointer-events-none w-4/12 ml-auto z-10 -right-16 absolute inset-0 -mr-10 hidden lg:block">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div class="gradient-blur pointer-events-none z-10 w-4/12 -left-16 absolute inset-0 rotate-180 -ml-10 hidden lg:block">
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
      <section class="w-full flex flex-col lg:flex-row lg:max-w-none max-w-md mx-auto mb-16">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full"></div>
        <div class="flex flex-col max-w-nav mr-auto"></div>
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full ml-auto"></div>
      </section>
      <section class="w-full flex flex-col lg:flex-row lg:max-w-none max-w-md mx-auto mb-24">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full lg:mb-0 mb-8">
          <h3 class="text-lg font-semibold md:mb-0">Favorite Meals</h3>
        </div>
        <div class="w-full grid 2xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-16 lg:justify-center lg:flex-row">
          <div>
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
          <div>
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
          <div>
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
      <section class="w-full flex flex-col lg:flex-row lg:max-w-none max-w-md mx-auto mb-16 lg:mb-24">
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full">
          <h3 class="text-lg font-semibold mb-8 lg:mb-0">Songs & Movies</h3>
        </div>
        <div class="xl:flex flex-col lg:flex-row gap-16 w-full">
          <div class="lg:max-w-nav w-full flex-shrink-0 grid md:grid-cols-2 gap-16">
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
          <div class="w-full xl:max-w-none max-w-nav grid md:grid-cols-2 gap-8">
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
            <div class="flex items-center flex-col gap-4 w-full mb-2">
              <img
                alt={song.name}
                src={song.cover}
                class="w-40 aspect-square mb-4 rounded-full active:cursor-progress md:hover:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent"
              />
              <Button type="secondary" class="w-full" link={song.link}>
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
            class={`bg-neutral-100 md:h-[236px] h-80 mb-3 bg-cover bg-top flex items-end overflow-hidden`}
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
    <div class="max-w-nav w-full mb-16 lg:pl-4">
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
        small
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
              <table class="w-full border-spacing-1 table-auto rounded-xl border overflow-hidden border-neutral-200 border-separate">
                <thead class="bg-neutral-50 h-10 text-neutral-900">
                  <tr>
                    <th class="text-left font-medium px-4 rounded-lg">Job</th>
                    <th class="text-left font-medium px-4 rounded-lg">Time</th>
                    <th class="text-left font-medium px-4 rounded-lg max-lg:hidden">
                      Description
                    </th>
                  </tr>
                </thead>
                {experience.map((item) => {
                  return (
                    <tr class="bg-neutral-50 hover:bg-neutral-100 transition-all duration-75">
                      <td class="h-14 px-4 rounded-lg">
                        <a
                          target="_blank"
                          href={item.url ?? undefined}
                          class="hover:bg-neutral-100 p-0"
                        >
                          {item.jobTitle}{" "}
                          {item.company && m.about_education_at()}{" "}
                          {item.company}
                        </a>
                      </td>
                      <td class="text-sm mt-0.5 h-14 px-4 rounded-lg">
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
                        <td class="text-neutral-500 h-14 px-4 rounded-lg max-w-md max-lg:hidden">
                          <p class="line-clamp-2">{item.slogan}</p>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </table>
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
    <div class="lg:max-w-nav w-full lg:pl-4">
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
        small
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
              <table class="w-full border-spacing-1 table-auto rounded-xl border overflow-hidden border-neutral-200 border-separate">
                <thead class="bg-neutral-50 h-10 text-neutral-900">
                  <tr>
                    <th class="text-left font-medium px-4 rounded-lg">
                      Education
                    </th>
                    <th class="text-left font-medium px-4 rounded-lg">Time</th>
                  </tr>
                </thead>
                {education.map((item) => {
                  return (
                    <tr
                      class="bg-neutral
                -50 hover:bg-neutral-100 transition-all duration-75 bg-neutral-50"
                    >
                      <td class="h-14 px-4 rounded-lg">
                        <a
                          target="_blank"
                          href={item.url ?? undefined}
                          class="hover:bg-neutral-100 p-0"
                        >
                          {item.educationType}{" "}
                          {item.school && m.about_education_at()} {item.school}
                        </a>
                      </td>
                      <td class="text-sm mt-0.5 h-14 px-4 rounded-lg">
                        <p class="line-clamp-2">
                          {item.from} -{" "}
                          {item.to !== m.about_education_now() ? (
                            item.to
                          ) : (
                            <span class="text-green-600">{item.to}</span>
                          )}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </table>
            </div>
          </div>
        </Popup>
      </NoPrerender>
    </div>
  )
}
