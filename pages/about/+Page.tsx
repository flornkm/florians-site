import { InlineInfo } from "#components/Inline"
import Tooltip from "#components/Tooltip"
import Check from "~icons/eva/checkmark-outline"
import { PhotoSlider } from "#components/Slider"
import Button, { InlineLink } from "#components/Button"
import * as m from "#lang/paraglide/messages"

export default function Page() {
  const experience = [
    {
      company: "inlang",
      comapanyLink: "https://inlang.com/",
      from: "06 / 2023",
      to: "Now",
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
      link: "https://apps.apple.com/us/app/finanzguru-konten-vertr%C3%A4ge/id1214803607",
    },
    {
      name: "Cron",
      icon: "/images/apps/app_cron.jpg",
      link: "https://apps.apple.com/us/app/finanzguru-konten-vertr%C3%A4ge/id1214803607",
    },
  ]

  return (
    <div class="w-full">
      <section class="w-full lg:pt-16">
        <h1 class="text-3xl font-semibold mb-16 w-full">{m.about_title()}</h1>
        <div class="flex gap-12 lg:flex-row flex-col mb-24">
          <div class="max-w-[170px] w-full flex-shrink-0">
            <img
              src="/images/avatars/florian_student.webp"
              class="aspect-square rounded-full"
              alt="Florian as a student at HfG Schwäbisch Gmünd"
            />
          </div>
          <div class="flex-grow md:max-w-md">
            <h1 class="text-xl font-semibold mb-3">
              {m.about_explainer_heading()}
            </h1>
            <p class="text-zinc-500 mb-4 dark:text-zinc-400">
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
            <p class="text-zinc-500 mb-4 dark:text-zinc-400">
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
            <p class="text-zinc-500 mb-4 dark:text-zinc-400">
              {m.about_explainer_text_now()} {new Date().getFullYear() - 2013}{" "}
              {m.about_explainer_text_later()}
              <br />
              <span class="font-medium">{m.design_engineer()}</span>.
            </p>
          </div>
          <div class="max-w-s w-full flex-shrink-0 lg:ml-auto xs:grid xs:grid-cols-2">
            <div class="self-start mb-10 xs:mb-0">
              <h2 class="font-semibold mb-3">{m.about_socials_title()}</h2>
              <ul class="space-y-2 -ml-1">
                <li>
                  <InlineLink class="ml-1" link="https://x.com/flornkm/">
                    x.com
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    class="ml-1"
                    link="https://www.linkedin.com/in/flornkm/"
                  >
                    LinkedIn
                  </InlineLink>
                </li>
                <li>
                  <InlineLink class="ml-1" link="https://read.cv/flornkm">
                    Read.cv
                  </InlineLink>
                </li>
                <li>
                  <InlineLink class="ml-1" link="https://github.com/flornkm">
                    GitHub
                  </InlineLink>
                </li>
              </ul>
            </div>{" "}
            <div class="place-self-end self-start">
              <h2 class="font-semibold mb-3">{m.about_contact_title()}</h2>
              <ul class="space-y-2 -ml-1">
                <li>
                  <InlineLink class="ml-1" link="mailto:hello@floriankiem.com">
                    {m.link_email()}
                  </InlineLink>
                </li>
                <li>
                  <InlineLink
                    class="ml-1"
                    link="imessage://hello@floriankiem.com"
                  >
                    {m.link_imessage()}
                  </InlineLink>
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
                    <p class="text-zinc-500 dark:text-zinc-400">
                      {item.slogan}
                    </p>
                  )}
                </div>
                {experience.indexOf(item) !== experience.length - 1 && (
                  <div class="border-b border-b-zinc-100 my-8 dark:border-b-zinc-900" />
                )}
              </div>
            )
          })}
        </div>
      </section>
      <section class="w-full mb-32">
        <h2 class="text-xl font-medium mb-32 text-zinc-400 dark:text-zinc-500">
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
                          class="w-16 h-16 rounded-2xl border border-zinc-200 cursor-alias hover:shadow-lg hover:shadow-black/5 transition-all dark:border-zinc-800"
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
                          class="w-16 h-16 rounded-2xl border border-zinc-200 cursor-alias hover:shadow-lg hover:shadow-black/5 transition-all dark:border-zinc-800"
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
                    "flex items-start gap-3 dark:text-zinc-400 " +
                    (entry.checked
                      ? "line-through selection:bg-transparent selection:text-black"
                      : "")
                  }
                >
                  <div class="bg-zinc-100 hover:bg-zinc-200 hover:border-zinc-300 transition-colors border flex-shrink-0 cursor-not-allowed border-zinc-200 bg-gradient-to-tr rounded-md flex items-center justify-center w-6 h-6 relative dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800">
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
            <h3 class="text-lg font-semibold mb-4">{m.about_music_title()}</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 w-full gap-8">
              <div>
                <div class="md:h-64 h-80 md:pt-20 hover:pt-0 md:px-8 px-4 md:hover:h-64 lg:hover:h-80 overflow-hidden bg-zinc-100 mb-2 transition-all hover:lg:bg-zinc-200 group flex items-center justify-center gap-16 flex-col lg:gap-8 dark:bg-zinc-950 dark:lg:hover:bg-zinc-900">
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
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors dark:text-zinc-700 dark:hover:text-zinc-600"
                >
                  {m.cover_image_source()}
                </a>
              </div>
              <div>
                <div class="md:h-64 h-80 md:pt-20 hover:pt-0 md:px-8 px-4 md:hover:h-64 lg:hover:h-80 overflow-hidden bg-zinc-100 mb-2 transition-all hover:lg:bg-zinc-200 group flex items-center justify-center gap-16 flex-col lg:gap-8 dark:bg-zinc-950 dark:lg:hover:bg-zinc-900">
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
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors dark:text-zinc-700 dark:hover:text-zinc-600"
                >
                  {m.cover_image_source()}
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
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors dark:text-zinc-700 dark:hover:text-zinc-600"
                >
                  {m.cover_image_source()}
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
                  class="mt-2 text-xs text-zinc-300 hover:text-zinc-400 cursor-alias transition-colors dark:text-zinc-700 dark:hover:text-zinc-600"
                >
                  {m.cover_image_source()}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
