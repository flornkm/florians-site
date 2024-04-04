import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import { Check } from "#design-system/Icons"
import { PhotoSlider } from "#components/Slider"
import Button, { InlineLink } from "#components/Button"
import * as m from "#lang/paraglide/messages"
import { useEffect, useState } from "preact/hooks"
import { Popup, usePopup } from "#components/Popup"
import NoPrerender from "#components/NoPrerender"

export default function Page() {
  const {
    isOpen: aboutPopupOpen,
    openPopup: openAboutPopup,
    closePopup: closeAboutPopup,
    popup: aboutPopup,
  } = usePopup()

  const experience = [
    {
      from: "02 / 2024",
      to: "Now",
      jobTitle: m.about_experience_tritschlerkiem_job(),
    },
    {
      company: "inlang",
      comapanyLink: "https://inlang.com/",
      from: "06 / 2023",
      to: "01 / 2024",
      slogan: m.about_experience_inlang_slogan(),
      jobTitle: m.about_experience_inlang_job(),
    },
    {
      company: m.about_experience_tritschlerkiem_company(),
      comapanyLink: "https://tritschlerkiem.com/",
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

  return (
    <div class="w-full">
      <section class="w-full flex gap-4 flex-col lg:flex-row py-4 md:mb-8">
        <div class="lg:w-1/3 mb-4 md:mb-0">
          <h1 class="text-2xl line-clamp-2 text-neutral-400 selection:bg-blue-50 selection:text-blue-300 dark:text-neutral-500 dark:selection:bg-blue-950 dark:selection:text-blue-500 font-semibold leading-snug transition-colors group hover:text-neutral-400">
            {m.about_title()}
          </h1>
        </div>
        <div class="lg:max-w-nav w-full lg:mx-auto">
          <div class="w-full h-40 rounded-2xl bg-neutral-100 relative bg-[url('/images/photos/netherlands.jpg')] bg-cover bg-center mb-16">
            <img
              src="/images/avatars/florian_student.webp"
              class="aspect-square rounded-full w-24 absolute -bottom-12 left-0 border-4 border-light-neutral"
              alt="Florian as a student"
            />
          </div>
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
        <div class="w-1/3 hidden lg:block" />
      </section>
      <section class="w-full flex gap-4 flex-col lg:flex-row py-4 md:mb-64 lg:max-w-none max-w-md mx-auto">
        <div class="lg:w-1/3">
          <h2 class="text-xl font-semibold md:sticky md:top-20 md:mb-0">
            {m.about_education_title()}
          </h2>
        </div>
        <div class="lg:max-w-nav w-full lg:mx-auto">
          <p class="text-neutral-500 mb-4">
            Working as a {experience[0].jobTitle}
            {experience[0].company && `at ${experience[0].company}`}
            {experience[0].from && ` since ${experience[0].from}`}
            {experience[0].to && ` until ${experience[0].to}`}.
          </p>
          <p class="text-neutral-500 mb-8">
            In the past, I worked at{" "}
            {experience
              .filter((item) => item.company)
              .map((item) => {
                const [loading, setLoading] = useState<Boolean>(true)
                const [fetchable, setFetchable] = useState<Boolean>(false)

                useEffect(() => {
                  fetch(
                    `https://api.microlink.io/?url=${item.comapanyLink}&embed=logo.url`
                  )
                    .then((res) => res.ok && setFetchable(true))
                    .finally(() => {
                      console.log("done")
                      setLoading(false)
                    })
                }, [fetchable])

                return item.comapanyLink ? (
                  <InlineLink
                    link={item.comapanyLink}
                    class="inline-block items-center gap-1 text-black mr-1.5"
                  >
                    {item.comapanyLink && fetchable ? (
                      <img
                        class="w-6 aspect-square ml-1 rounded-sm inline-block mx-1 -translate-y-0.5"
                        src={`https://api.microlink.io/?url=${item.comapanyLink}&embed=logo.url`}
                      />
                    ) : (
                      loading && (
                        <div class="w-6 aspect-square ml-1 rounded-sm inline-block mx-1 translate-y-1 bg-neutral-200 animate-pulse" />
                      )
                    )}
                    {item.company}
                    {experience.filter((item) => item.company).indexOf(item) !==
                    experience.filter((item) => item.company).length - 1
                      ? ", "
                      : ""}
                  </InlineLink>
                ) : (
                  <span class="inline-block items-center gap-1 text-black mr-1.5 font-medium">
                    {item.comapanyLink && fetchable ? (
                      <img
                        class="w-6 aspect-square ml-1 rounded-sm inline-block mx-1 -translate-y-0.5"
                        src={`https://api.microlink.io/?url=${item.comapanyLink}&embed=logo.url`}
                      />
                    ) : (
                      loading && (
                        <div class="w-6 aspect-square ml-1 rounded-sm inline-block mx-1 translate-y-1 bg-neutral-200 animate-pulse" />
                      )
                    )}
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
              openAboutPopup()
            }}
          >
            Open Experience
          </Button>
          <NoPrerender>
            <Popup
              popup={aboutPopup}
              onClose={closeAboutPopup}
              isOpen={aboutPopupOpen}
            >
              <div>
                <h3 class="text-lg font-semibold mb-8">Experience Sheet</h3>
                <div class="custom-scrollbar w-full overflow-x-scroll">
                  <table class="w-full border-spacing-1 table-auto rounded-xl min-w-[512px] border overflow-hidden border-neutral-200 border-separate">
                    <thead class="bg-neutral-50 h-10 text-neutral-900">
                      <tr>
                        <th class="text-left font-medium px-4 rounded-lg">
                          Job
                        </th>
                        <th class="text-left font-medium px-4 rounded-lg">
                          Time
                        </th>
                        <th class="text-left font-medium px-4 rounded-lg">
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
                              href={item.comapanyLink ?? undefined}
                              class="hover:bg-neutral-100 p-0"
                            >
                              {item.jobTitle}{" "}
                              {item.company && m.about_education_at()}{" "}
                              {item.company}
                            </a>
                          </td>
                          <td class="font-mono text-sm mt-0.5 h-14 px-4 rounded-lg">
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
                            <td class="text-neutral-500 h-14 px-4 rounded-lg max-w-md">
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
        <div class="w-1/3 hidden lg:block" />
      </section>
      <section class="w-full flex gap-4 flex-col lg:items-end lg:flex-row py-4 md:mb-8">
        <div class="flex gap-12 lg:flex-row flex-col mb-24">
          <div class="max-w-[170px] w-full flex-shrink-0">
            <img
              src="/images/avatars/florian_student.webp"
              class="aspect-square rounded-full"
              alt="Florian as a student at HfG Schwäbisch Gmünd"
            />
          </div>

          <div class="max-w-s w-full flex-shrink-0 lg:ml-auto xs:grid xs:grid-cols-2">
            <div class="self-start mb-10 xs:mb-0">
              <h2 class="font-semibold mb-3">{m.about_socials_title()}</h2>
              <ul class="space-y-2 -ml-1">
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="https://x.com/flornkm/"
                  >
                    x.com
                  </Button>
                </li>
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="https://www.linkedin.com/in/flornkm/"
                  >
                    LinkedIn
                  </Button>
                </li>
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="https://read.cv/flornkm"
                  >
                    Read.cv
                  </Button>
                </li>
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="https://github.com/flornkm"
                  >
                    GitHub
                  </Button>
                </li>
              </ul>
            </div>{" "}
            <div class="place-self-end self-start">
              <h2 class="font-semibold mb-3">{m.about_contact_title()}</h2>
              <ul class="space-y-2 -ml-1">
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="mailto:hello@floriankiem.com"
                  >
                    {m.link_email()}
                  </Button>
                </li>
                <li>
                  <Button
                    type="text"
                    class="-ml-0.5"
                    link="imessage://hello@floriankiem.com"
                  >
                    {m.link_imessage()}
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section class="w-full flex flex-col md:flex-row md:gap-12 mb-48">
        <div class="md:w-full md:max-w-[170px]">
          <h2 class="text-lg font-semibold md:sticky md:top-20 md:mb-0 mb-8">
            {m.about_education_title()}
          </h2>
        </div>
        <div class="py-0.5">
          {experience.map((item) => {
            return (
              <div>
                <div>
                  <div class="flex gap-2 mb-1 items-center">
                    <p>
                      {item.jobTitle} {item.company && m.about_education_at()}{" "}
                      {item.comapanyLink ? (
                        <InlineLink link={item.comapanyLink}>
                          {item.company}
                        </InlineLink>
                      ) : (
                        item.company
                      )}
                    </p>
                  </div>
                  <p class="text-sm mb-4">
                    {item.from} -{" "}
                    {item.to !== m.about_education_now() ? (
                      item.to
                    ) : (
                      <span class="text-green-600">{item.to}</span>
                    )}
                  </p>
                  {item.slogan && (
                    <p class="text-neutral-500 dark:text-neutral-400">
                      {item.slogan}
                    </p>
                  )}
                </div>
                {experience.indexOf(item) !== experience.length - 1 && (
                  <div class="border-b border-b-neutral-100 my-8 dark:border-b-neutral-900" />
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-32">
        <h2 class="text-xl font-medium mb-32 text-neutral-400 dark:text-neutral-500">
          {m.about_boring_first()}
          <br class="hidden md:block" />
          {m.about_boring_second()}
        </h2>
        <div class="mb-32 flex flex-col items-start">
          <h3 class="text-lg font-semibold mb-4">{m.about_photos_title()}</h3>
          <PhotoSlider autoPlay buttons />
        </div>
        <div class="w-full grid md:grid-cols-3 grid-rows-2 md:grid-rows-1 grid-cols-1 mb-32">
          <div class="w-full h-full col-span-1 md:col-span-2 flex flex-col justify-evenly pr-6">
            <h3 class="text-lg font-semibold mb-8">{m.about_apps_title()}</h3>
            <div class="flex items-center">
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
          <div class="md:w-full max-w-s md:justify-self-end flex-shrink-0">
            <h4 class="text-lg font-semibold mb-4">
              {m.about_bucket_list_title()}
            </h4>
            <ul class="space-y-4 list-none">
              {bucketList.map((entry) => (
                <li
                  class={
                    "flex items-start gap-3 dark:text-neutral-400 " +
                    (entry.checked
                      ? "line-through selection:bg-transparent selection:text-black"
                      : "")
                  }
                >
                  <div class="bg-neutral-100 hover:bg-neutral-200 p-2 hover:border-neutral-300 transition-colors border flex-shrink-0 cursor-not-allowed border-neutral-200 bg-gradient-to-tr rounded-md flex items-center justify-center w-6 h-6 relative dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-800">
                    {entry.checked && (
                      <Check
                        class="absolute -right-0.5 -top-0.5 w-5 h-5 active:animate-shake"
                        size={16}
                      />
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
            <h3 class="text-lg font-semibold mb-4">{m.about_music_title()}</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 w-full gap-8">
              <div class="relative">
                <div class="md:h-64 h-80 md:pt-20 hover:pt-0 md:px-8 px-4 md:hover:h-64 lg:hover:h-80 overflow-hidden bg-neutral-100 mb-2 transition-all hover:lg:bg-neutral-200 group flex items-center justify-center gap-16 flex-col lg:gap-8 dark:bg-neutral-950 dark:lg:hover:bg-neutral-900">
                  <img
                    alt="Enjoy the Silence by Depeche Mode"
                    src="/images/music-covers/enjoy_silence.jpg"
                    class="w-40 h-40 rounded-full aspect-square active:cursor-progress md:active:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent"
                  />
                  <Button
                    type="secondary"
                    class="w-full md:group-hover:opacity-100 md:opacity-0 selection:bg-transparent opacity-100"
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
                  class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
                >
                  {m.cover_image_source()}
                </a>
              </div>
              <div class="relative">
                <div class="md:h-64 h-80 md:pt-20 hover:pt-0 md:px-8 px-4 md:hover:h-64 lg:hover:h-80 overflow-hidden bg-neutral-100 mb-2 transition-all hover:lg:bg-neutral-200 group flex items-center justify-center gap-16 flex-col lg:gap-8 dark:bg-neutral-950 dark:lg:hover:bg-neutral-900">
                  <img
                    alt="Serotonin Moonbeams by The Blessed Madonna"
                    src="/images/music-covers/serotonin_moonbeams.jpg"
                    class="w-40 h-40 rounded-full aspect-square active:cursor-progress md:active:rotate-[360deg] transition-transform duration-1000 selection:bg-transparent"
                  />
                  <Button
                    type="secondary"
                    class="w-full md:group-hover:opacity-100 md:opacity-0 selection:bg-transparent opacity-100"
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
                  class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
                >
                  {m.cover_image_source()}
                </a>
              </div>
            </div>
          </div>
          <div class="mb-20 flex flex-col items-start">
            <h3 class="text-lg font-semibold mb-4">Movies and series</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 w-full gap-8">
              <div class="relative">
                <div class="bg-neutral-100 md:h-64 h-80 mb-2 bg-[url('/images/movies-series/interstellar.jpg')] bg-cover bg-top flex items-end overflow-hidden">
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
                  class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
                >
                  {m.cover_image_source()}
                </a>
                <div class="h-20 hidden md:block" />
              </div>
              <div class="relative">
                <div class="bg-neutral-100 md:h-64 h-80 mb-2 bg-[url('/images/movies-series/wecrashed.jpg')] bg-cover bg-top flex items-end overflow-hidden">
                  <div class="text-white font-medium pb-4 px-4 relative w-full bg-gradient-to-t from-black/75 to-transparent pt-32 flex xs:justify-between items-start xs:gap-0 gap-2 xs:items-end flex-col xs:flex-row">
                    <p class="leading-none">WeCrashed </p>
                    <a
                      target="_blank"
                      href="https://www.netflix.com/"
                      class="cursor-alias text-sm px-3 py-0.5 bg-black rounded-full transition-colors hover:bg-neutral-800"
                    >
                      Apple TV+
                    </a>
                  </div>
                </div>
                <a
                  href="https://www.vogue.co.uk%2Farts-and-lifestyle%2Farticle%2Fwecrashed-apple-tv&psig=AOvVaw1TmOHYBg5jLkyGFaFlWq5Y&ust=1697491485478000&source=images&cd=vfe&opi=89978449&ved=0CBQQ3YkBahcKEwjAmefZ_viBAxUAAAAAHQAAAAAQJA"
                  target="_blank"
                  class="mt-2 text-xs text-neutral-300 hover:text-neutral-400 cursor-alias transition-colors dark:text-neutral-700 dark:hover:text-neutral-600"
                >
                  {m.cover_image_source()}
                </a>
                <div class="h-20 hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
