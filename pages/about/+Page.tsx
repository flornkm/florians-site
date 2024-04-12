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
      <section class="w-full flex flex-col lg:flex-row pb-4 md:mb-4 mb-8 lg:mb-12">
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full mb-4 md:mb-8">
          <h1 class="text-2xl line-clamp-2 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group">
            {m.about_title()}
          </h1>
        </div>
        <div class="w-full lg:mx-auto">
          <div class="w-full h-40 lg:h-48 rounded-2xl bg-neutral-100 max-w-xl relative bg-[url('/images/photos/netherlands.jpg')] bg-cover bg-center mx-auto lg:ml-0">
            <div class="w-full max-w-nav mx-auto left-1/2 -translate-x-1/2 absolute -bottom-12">
              <img
                src="/images/avatars/florian_student.webp"
                class="aspect-square rounded-full w-24 border-4 border-light-neutral dark:border-black"
                alt="Florian as a student"
              />
            </div>
          </div>
        </div>
        <div class="lg:max-w-[calc((100%-432px)/2)] w-full hidden lg:block" />
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
            <h3 class="text-lg font-semibold mt-12 mb-2">
              {m.experience_title()}
            </h3>
            <Experience />
          </div>
        </div>
        <div class="md:mb-0 lg:max-w-[calc((100%-432px)/2)] w-full lg:pl-8" />
      </section>
      <section class="w-full flex flex-col items-center lg:max-w-none max-w-md mx-auto mb-16 md:py-12 lg:p-8 relative z-10">
        <div class="w-full max-w-nav">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">
            {m.bucketlist_title()}
          </h3>
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
                        strokeLinecap="round"
                      >
                        <rect
                          x="0.75"
                          y="0.75"
                          width="14.5"
                          height="14.5"
                          stroke="currentColor"
                          stroke-width="1.5"
                          rx="2"
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
      <section class="mb-40">
        <div class="w-full max-w-nav mx-auto mb-24">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">{m.movies_title()}</h3>
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
        <div class="w-full max-w-nav mx-auto mb-32">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">{m.music_title()}</h3>
          <Music
            music={[
              {
                name: "Enjoy the Silence by Depeche Mode",
                cover: "/images/music-covers/enjoy_silence.jpg",
                url: "https://open.spotify.com/album/13OoJ5Y23cdo8CDAiQwznb",
                source: "https://en.wikipedia.org/wiki/Enjoy_the_Silence",
              },
              {
                name: "Serotonin Moonbeams by The Blessed Madonna",
                cover: "/images/music-covers/serotonin_moonbeams.jpg",
                url: "https://open.spotify.com/album/1UTc8WInycl4tVgJ1yODaO",
                source:
                  "https://www.stereogum.com/2205763/the-blessed-madonna-serotonin-moonbeams-feat-uffie/music/",
              },
            ]}
          />
        </div>
        <div class="w-full max-w-nav mx-auto mb-24">
          <h3 class="text-lg font-semibold mb-4 md:mb-4">{m.meals_title()}</h3>
          <Meals
            meals={[
              {
                title: "Healthy Chicken",
                cover: "/images/about/meals/healthy-chicken.webp",
                provider: "Selfmade",
              },
              {
                title: "Avocado Bread",
                cover: "/images/about/meals/avocado-bread.webp",
                provider: "Selfmade",
              },
              {
                title: "Tasty Ramen",
                cover: "/images/about/meals/tasty-ramen.webp",
                provider: "Buya Ramen Factory (Berlin)",
              },
            ]}
          />
        </div>
      </section>
      <section class="mb-16">
        <h3 class="text-lg font-semibold mb-4">{m.photos_title()}</h3>
        <div class="w-full">
          <PhotoSlider />
        </div>
        <Button type="secondary" link="/archive/photos" class="mt-8 mx-auto">
          More photos
        </Button>
      </section>
    </div>
  )
}

const Music = ({ music }: { music: Record<string, string>[] }) => {
  return (
    <>
      {music.map((song) => {
        return (
          <div class="flex gap-4 mb-8">
            <img
              src={song.cover}
              class="w-32 aspect-square object-cover rounded-full"
            />
            <div class="flex flex-col justify-between truncate">
              <div class="w-full">
                <h4 class="font-semibold mb-2 truncate">{song.name}</h4>
                <Button type="text" link={song.url} class="!px-0">
                  {m.listen_now()}
                </Button>
              </div>
              <Button type="text" link={song.source} small class="!px-0">
                {m.source()}
              </Button>
            </div>
          </div>
        )
      })}
    </>
  )
}

const Meals = ({ meals }: { meals: Record<string, string>[] }) => {
  return (
    <>
      {meals.map((meal) => (
        <div class="flex gap-4 mb-8">
          <img
            src={meal.cover}
            class="w-32 aspect-square object-contain rounded-lg"
          />
          <div class="flex flex-col justify-between">
            <div>
              <h4 class="font-semibold mb-2">{meal.title}</h4>
              <p class="text-neutral-400 dark:text-neutral-500">
                {meal.provider === "Selfmade"
                  ? "Cooked by myself."
                  : `Available at ${meal.provider}.`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

const Movies = ({ movies }: { movies: Record<string, string>[] }) => {
  return (
    <>
      {movies.map((movie) => (
        <div class="flex gap-4 mb-8">
          <img
            src={movie.cover}
            class="w-32 aspect-[12/16] object-cover rounded-lg"
          />
          <div class="flex flex-col justify-between">
            <div>
              <h4 class="font-semibold mb-2">{movie.title}</h4>
              <Button type="text" link={movie.url} class="!px-0">
                {m.watch_now()}
              </Button>
            </div>
            <div>
              <p class="text-neutral-400 dark:text-neutral-500 text-sm">
                {m.available()} {movie.provider}.
              </p>
            </div>
          </div>
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
    <div class="max-w-nav w-full mb-4">
      <p class="text-neutral-500 mb-4 dark:text-neutral-400">
        {m.working_as_a()} {experience[0].jobTitle}
        {experience[0].company &&
          `${experience[0].jobTitle && `at`} ${experience[0].company}`}
        {experience[0].from && ` since ${experience[0].from}`}
        {experience[0].to && ` until ${experience[0].to}`}.
      </p>
      <p class="text-neutral-500 mb-8 dark:text-neutral-400">
        {m.past_worked()}{" "}
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
          {m.open_experience()}
          <Expand class="w-4 h-4 ml-1" />
        </>
      </Button>
      <NoPrerender>
        <Popup
          popup={experiencePopup}
          onClose={closeExperiencePopup}
          isOpen={experiencePopupOpen}
        >
          <div>
            <h3 class="text-lg font-semibold mb-8">{m.experience_sheet()}</h3>
            <div class="custom-scrollbar w-full overflow-x-scroll">
              <div class="overflow-hidden border border-neutral-200 rounded-xl dark:border-neutral-700">
                <table class="w-full border-spacing-1 table-auto rounded-xl border-collapse">
                  <thead class="h-10 text-neutral-900 bg-neutral-100 dark:text-white dark:bg-neutral-800">
                    <tr>
                      <th class="text-left font-medium px-4">{m.job()}</th>
                      <th class="text-left font-medium px-4">{m.time()}</th>
                      <th class="text-left font-medium px-4 max-lg:hidden">
                        {m.description()}
                      </th>
                    </tr>
                  </thead>
                  {experience.map((item) => {
                    return (
                      <tr>
                        <td class="h-14 px-4 rounded-lg border border-neutral-200 border-b-0 border-l-0 dark:border-neutral-700">
                          <a
                            target="_blank"
                            class="p-0"
                            href={item.url ?? undefined}
                          >
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
