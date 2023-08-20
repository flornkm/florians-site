import Image from "next/image"
import Link from "next/link"
import * as Icon from "react-feather"

function Timeline() {
  return (
    <div className="gap-0 grid grid-cols-2 max-md:flex max-md:flex-col max-md:gap-0 mb-8">
      <div className="flex gap-8 max-lg:flex-col max-md:gap-4 max-w-lg row-span-1 max-md:order-2 max-md:mb-24 md:pt-4 md:pb-16">
        <div className="justify-center flex flex-col">
          <h1 className="text-xl font-semibold mb-3">About me</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-2">
            My name is Flo and I am currently&nbsp;
            {new Date().getFullYear() - 2001}
            &nbsp;years old. I am a designer and developer and I love to create
            beautiful products. Currently I am studying at the Hochschule fuer
            Gestaltung, also known as just HfG, in Schwaebisch Gmuend, Germany.
          </p>
          <p className="text-zinc-600 dark:text-zinc-300">
            Beside my desire to work between design and code I love working with
            CSS and creating animations for web and mobile applications.
          </p>
        </div>
      </div>
      <div className="row-span-2 order-first">
        <Image
          alt="Florian"
          src="/images/florian_student.webp"
          className="inline-flex object-cover mb-12 object-top max-h-96 aspect-square rounded-full max-md:w-40 max-md:h-40 first-chil max-md:rounded-full border border-zinc-200 dark:border-zinc-700 dark:ring-0 relative z-10 row-span-2"
          width={300}
          height={200}
        />
        <div className="flex flex-col gap-4 max-md:hidden">
          <h2 className="font-medium text-lg">Let&apos;s connect</h2>
          <div className="flex gap-4 max-sm:flex-col">
            <Link
              className="font-medium transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              href={"https://read.cv/floriandwt"}
              target="_blank"
            >
              Read.cv
              <Icon.ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
              />
            </Link>
            <Link
              className="font-medium transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              href={"https://github.com/floriandwt"}
              target="_blank"
            >
              GitHub
              <Icon.ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
              />
            </Link>
            <Link
              className="font-medium transition-all text-black border-b-black group dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md"
              href={"https://www.linkedin.com/in/floriandwt/"}
              target="_blank"
            >
              LinkedIn
              <Icon.ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 order-3 mb-16">
        <h2 className="font-medium text-lg">Experience</h2>
        <Link
          href="https://inlang.com/"
          target="_blank"
          className="flex items-center w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="inlang"
              src="/images/company_inlang.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 dark:border-zinc-900 p-1 bg-white dark:bg-black"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Design Engineer</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">inlang</p>
            </div>
          </div>
          <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">
            2023 -{" "}
            <span className="text-green-500 font-sans font-medium">Now</span>
          </p>
        </Link>
        <Link
          href="https://meta-hype.com/"
          target="_blank"
          className="flex items-center w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="Metahype"
              src="/images/company_metahype.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Design Engineer</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Metahype
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">
            2020 - 2023
          </p>
        </Link>
        <Link
          href="https://www.hfg-gmuend.de/"
          target="_blank"
          className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="HfG Schwaebisch Gmuend"
              src="/images/company_hfg.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Webdesign Tutor</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                HfG Schwaebisch Gmuend
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">
            2022
          </p>
        </Link>
        <div className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md">
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="Comondo"
              src="/images/company_comondo.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Lead (Web-) Designer</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Comondo
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">
            2020 - 2021
          </p>
        </div>
        <div className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md">
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="Freelance"
              src="/images/company_videoeditor.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 dark:border-[#19C073] p-1 bg-white dark:bg-[#19C073]"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">
                Videoeditor and Motion Designer
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Freelance
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">
            2015 - 2020
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6 order-4 col-start-2">
        <h2 className="font-medium text-lg">Side projects</h2>
        <Link
          href="https://bridge.supply/"
          target="_blank"
          className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="Bridge"
              src="/images/project_bridge.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Bridge</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Product that helps creating job pages in a matter of minutes
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="https://curations.tech/"
          target="_blank"
          className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <div className="flex gap-2 place-items-center ">
            <Image
              alt="Curations"
              src="/images/project_curations.jpg"
              className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1.5 bg-white"
              width={40}
              height={40}
            />
            <div>
              <h3 className="font-medium text-md">Curations</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Website featuring useful curations for designers and developers
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Timeline
