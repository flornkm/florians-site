"use client"

import Image from "next/image"
import type { Post } from "@/app/feed/schema"
import Link from "next/link"
import * as Icon from "react-feather"
import { PhosphorLogo } from "phosphor-react"

function RecordLayout(props: { url?: string; children: React.ReactNode }) {
  return props.url ? (
    <Link
      key={props.url}
      href={props.url}
      target={props.url.includes("https") ? "_blank" : "_self"}
      className="gap-24 py-8 flex w-full justify-between group mx-auto max-md:flex-col max-md:gap-12"
    >
      {props.children}
    </Link>
  ) : (
    <div className="gap-24 py-8 flex w-full justify-between group mx-auto max-md:flex-col max-md:gap-12">
      {props.children}
    </div>
  )
}

export function FeedRecords({ feed }: { feed: Record<string, any>[] }) {
  return (
    <div className="flex flex-col justify-center">
      {feed.map((post: Record<string, any>) => {
        post.date = new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        return (
          <>
            <RecordLayout url={post.url}>
              <div className="flex gap-8 group-hover:opacity-60 dark:group-hover:opacity-80 duration-150 line-clamp-1">
                <div className="flex flex-col gap-1 max-w-sm">
                  <h3 className="font-medium text-lg text-zinc-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-zinc-500 line-clamp-2 dark:text-zinc-400">
                    {post.description
                      .replaceAll("#", "")
                      .replaceAll("*", "")
                      .replaceAll(/<[^>]*>/g, "")}
                  </p>
                </div>
              </div>
              <div className="h-full flex md:w-32 flex-col items-start gap-2 text-zinc-800 dark:text-zinc-200">
                <pre className="font-mono text-xs group-hover:opacity-60 dark:group-hover:opacity-80 duration-150">
                  {post.date}
                </pre>
                <Link
                  className="flex items-center font-medium text-sm gap-1 py-0.5 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md group/platform"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  target={
                    post.platform.url.includes("https") ? "_blank" : "_self"
                  }
                  href={post.platform.url}
                >
                  <Image
                    src={post.platform.icon}
                    alt="Post Image"
                    width={16}
                    height={16}
                    className="rounded-md mr-1 bg-white object-cover"
                  />
                  <h4>{post.platform.name}</h4>
                  {post.platform.url.includes("https") && (
                    <Icon.ArrowUpRight
                      size={16}
                      strokeWidth={2.5}
                      className="inline relative group-hover/platform:-right-1 group-hover/platform:-top-1.5 right-0 -top-0.5 transition-all"
                    />
                  )}
                </Link>
                <div className="flex gap-2 mt-0.5">
                  {post.collaborators &&
                    post.collaborators.map(
                      (collaborator: Record<string, any>) => {
                        return (
                          !collaborator.name.includes("Florian Kiem") && (
                            <Link
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                              key={post.collaborators.indexOf(collaborator)}
                              className={`group/reviewer relative transition-all`}
                              href={collaborator.url}
                              target="_blank"
                            >
                              <div
                                className={`absolute flex justify-center py-1 px-2.5 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover/reviewer:opacity-100 group-hover/reviewer:bottom-[125%] pointer-events-none transition-all bg-black text-white rounded-full w-max text-xs ease-in-out duration-200 dark:bg-white dark:text-black`}
                              >
                                <span className="z-10 relative">
                                  {collaborator.name}
                                </span>
                                <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
                              </div>
                              <Image
                                src={collaborator.avatar}
                                alt={collaborator.name}
                                className="inline-flex ring-1 ring-zinc-300 dark:ring-zinc-700 object-cover object-center max-h-128 rounded-full"
                                width={24}
                                height={24}
                              />
                            </Link>
                          )
                        )
                      }
                    )}
                </div>
              </div>
            </RecordLayout>
            {feed.length !== feed.indexOf(post as Post) + 1 && (
              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-900" />
            )}
          </>
        )
      })}
    </div>
  )
}

export function ColophonRecord() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">Typography</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={
              "https://github.com/orioncactus/pretendard/blob/main/packages/pretendard/docs/en/README.md"
            }
            target="_blank"
          >
            Pretendard
          </Link>
          <Link
            className="font-medium font-display transition-all text-black text-lg relative -top-0.5 border-b-black group pt-1 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://fonts.google.com/specimen/Gaegu"}
            target="_blank"
          >
            Gaegu
          </Link>
          <Link
            className="font-medium font-mono transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://fonts.google.com/specimen/JetBrains+Mono"}
            target="_blank"
          >
            JetBrains Mono
          </Link>
        </div>
      </div>
      <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">Iconography</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://feathericons.com/"}
            target="_blank"
          >
            <Icon.Feather className="w-5 h-5 text-blue-500" />
            Feather Icons
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://phosphoricons.com/"}
            target="_blank"
          >
            <PhosphorLogo className="w-5 h-5 text-rose-500" weight="fill" />
            Phosphor (For filled icons)
          </Link>
        </div>
      </div>
      <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">Photography</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.alicesopp.com/"}
            target="_blank"
          >
            <Image
              src="/images/people/alice_profile.jpg"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Alice Sopp
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.marcrufeis.de/"}
            target="_blank"
          >
            <Image
              src="/images/people/marc_profile.jpg"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Marc Rufeis
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.nilseller.com/"}
            target="_blank"
          >
            <Image
              src="/images/people/nils_profile.jpg"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Nils Eller
          </Link>
        </div>
      </div>
      <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">Technology</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.nextjs.org/"}
            target="_blank"
          >
            <svg
              aria-label="Next.js logomark"
              className="next-mark_root__wLeec"
              data-theme="light"
              height="16"
              role="img"
              viewBox="0 0 180 180"
              width="16"
            >
              <mask
                height="180"
                id="mask0_408_134"
                maskUnits="userSpaceOnUse"
                style={{ maskType: "alpha" }}
                width="180"
                x="0"
                y="0"
              >
                <circle cx="90" cy="90" fill="black" r="90"></circle>
              </mask>
              <g mask="url(#mask0_408_134)">
                <circle
                  cx="90"
                  cy="90"
                  data-circle="true"
                  fill="black"
                  r="90"
                ></circle>
                <path
                  d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
                  fill="url(#paint0_linear_408_134)"
                ></path>
                <rect
                  fill="url(#paint1_linear_408_134)"
                  height="72"
                  width="12"
                  x="115"
                  y="54"
                ></rect>
              </g>
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear_408_134"
                  x1="109"
                  x2="144.5"
                  y1="116.5"
                  y2="160.5"
                >
                  <stop stop-color="white"></stop>
                  <stop offset="1" stop-color="white" stop-opacity="0"></stop>
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint1_linear_408_134"
                  x1="121"
                  x2="120.799"
                  y1="54"
                  y2="106.875"
                >
                  <stop stop-color="white"></stop>
                  <stop offset="1" stop-color="white" stop-opacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            NextJS
          </Link>
          <Link
            className="font-medium flex truncate items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://tailwindcss.com/"}
            target="_blank"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              fill="none"
              viewBox="0 0 54 33"
            >
              <g clip-path="url(#prefix__clip0)">
                <path
                  fill="#38bdf8"
                  fill-rule="evenodd"
                  d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
                  clip-rule="evenodd"
                />
              </g>
              <defs>
                <clipPath id="prefix__clip0">
                  <path fill="#fff" d="M0 0h54v32.4H0z" />
                </clipPath>
              </defs>
            </svg>
            Tailwind CSS
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.vercel.com/"}
            target="_blank"
          >
            <svg
              aria-label="Vercel logomark"
              height="14"
              role="img"
              style={{ width: "auto", overflow: "visible" }}
              viewBox="0 0 74 64"
            >
              <path
                d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
                fill="currentColor"
              ></path>
            </svg>
            Vercel
          </Link>
          <Link
            className="font-medium flex items-center gap-1 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.formspree.io/"}
            target="_blank"
          >
            <svg
              className="text-red-500 scale-50 -mt-1"
              style={{ overflow: "visible" }}
              width="30"
              height="24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 3a3 3 0 013-3h26a3 3 0 013 3v4.286a3 3 0 01-3 3H3a3 3 0 01-3-3V3zm0 12.857a3 3 0 013-3h26a3 3 0 013 3v4.286a3 3 0 01-3 3H3a3 3 0 01-3-3v-4.286zm3 9.857a3 3 0 00-3 3V33a3 3 0 003 3h12a3 3 0 003-3v-4.286a3 3 0 00-3-3H3z"
                fill="currentColor"
              ></path>
            </svg>
            Formspree
          </Link>
        </div>
      </div>
      <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">Inspiration</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.eikedrescher.com/"}
            target="_blank"
          >
            <Image
              src="https://unavatar.io/eikedrescher"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Eike Drescher
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.linusrogge.com/"}
            target="_blank"
          >
            <Image
              src="https://unavatar.io/linusrogge"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Linus Rogge
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.marco.fyi/"}
            target="_blank"
          >
            <Image
              src="https://unavatar.io/marcofyi"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Marco Cornacchia
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://samuelkraft.com/"}
            target="_blank"
          >
            <Image
              src="https://unavatar.io/samuelkraft"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Samuel Kraft
          </Link>
        </div>
      </div>
      <div className="h-[1px] border-t border-dashed border-zinc-100 w-full mt-1 mb-1 dark:bg-zinc-800 dark:border-zinc-800"></div>
      <div className="flex justify-between w-full flex-wrap gap-4 max-md:flex-col max-md:items-start max-md:gap-8">
        <h2 className="text-lg text-zinc-400">With the help of</h2>
        <div className="flex gap-4 flex-wrap max-md:gap-4 items-center max-md:flex-col max-md:items-start">
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.antonstallboerger.com/"}
            target="_blank"
          >
            <Image
              src="/images/people/anton_stallboerger.jpg"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Anton Stallbörger
          </Link>
          <Link
            className="font-medium flex items-center gap-2 transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
            href={"https://www.nilseller.com/"}
            target="_blank"
          >
            <Image
              src="/images/people/nils_profile.jpg"
              alt="Photography"
              width={48}
              height={48}
              className="rounded-full h-6 w-6"
            />
            Nils Eller
          </Link>
        </div>
      </div>
    </div>
  )
}
