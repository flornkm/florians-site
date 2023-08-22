import Link from "next/link"
import Image from "next/image"
import { allProjects } from "contentlayer/generated"
import * as Icon from "react-feather"

function Projects() {
  return (
    <div className={"flex flex-col gap-8"}>
      {allProjects.map((project: any) => (
        <Link
          key={project._raw.flattenedPath}
          href={project._raw.flattenedPath}
          className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
        >
          <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
            <Image
              src={project.preview}
              alt="Image of the Bridge Landingpage in a Mockup"
              className="w-full max-h-[272px] object-contain transition-all"
              width={350}
              height={250}
            />
          </div>
          <div className="max-w-sm col-span-2">
            <div className="flex items-center">
              <h3 className="text-xl font-medium pb-1">{project.title}</h3>
              <Icon.ChevronRight
                size={22}
                className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
              />
            </div>
            <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              <div className="flex gap-2 items-center">
                <Icon.Calendar width={14} />
                <pre className="font-mono">
                  {`${project.date.split(" ")[1]}`} -{" "}
                  {project.date.split(" ")[3] === "Now" ? (
                    <span className={"text-green-500 font-sans font-medium"}>
                      {project.date.split(" ")[3]}
                    </span>
                  ) : (
                    project.date.split(" ")[1]
                  )}
                </pre>
              </div>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {project.description}
            </p>
          </div>
        </Link>
      ))}

      {/* <Link
        href={"./projects/bridge"}
        className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
      >
        <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
          <Image
            src="/images/bridge/bridge.webp"
            alt="Image of the Bridge Landingpage in a Mockup"
            className="w-full max-h-[272px] object-contain transition-all"
            width={350}
            height={250}
          />
        </div>
        <div className="max-w-sm col-span-2">
          <div className="flex items-center">
            <h3 className="text-xl font-medium pb-1">Bridge</h3>
            <Icon.ChevronRight
              size={22}
              className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
            />
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            <div className="flex gap-2 place-items-center">
              <Icon.Calendar width={14} />
              <p className="font-mono">
                Q1 2023 –{" "}
                <span className="text-green-500 font-sans font-medium">
                  Now
                </span>
              </p>
            </div>
          </div>
          <p className="pb-2 text-zinc-600 dark:text-zinc-400">
            Product that helps creating job pages in a matter of minutes
          </p>
        </div>
      </Link> */}

      {/* <Link
        href={"./projects/curations"}
        className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
      >
        <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
          <Image
            src="/images/curations/curations.webp"
            alt="Image of Curations in a Mockup"
            className="w-full max-h-[272px] object-contain transition-all"
            width={350}
            height={250}
          />
        </div>
        <div className="max-w-sm col-span-2">
          <div className="flex items-center">
            <h3 className="text-xl font-medium pb-1">Curations</h3>
            <Icon.ChevronRight
              size={22}
              className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
            />
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            <div className="flex gap-2 place-items-center">
              <Icon.Calendar width={14} />
              <p className="font-mono">
                Q4 2022 –{" "}
                <span className="text-green-500 font-sans font-medium">
                  Now
                </span>
              </p>
            </div>
          </div>
          <p className="pb-2 text-zinc-600 dark:text-zinc-400">
            Website featuring useful curations for designers and developers
          </p>
        </div>
      </Link>

      <Link
        href={"./projects/boost"}
        className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
      >
        <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
          <Image
            src="/images/boost/boost.webp"
            alt="Photo of the Boost Device"
            className="w-full max-h-[272px] object-contain transition-all"
            width={350}
            height={250}
          />
        </div>
        <div className="max-w-sm col-span-2">
          <div className="flex items-center">
            <h3 className="text-xl font-medium pb-1">Boost</h3>
            <Icon.ChevronRight
              size={22}
              className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
            />
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            <div className="flex gap-2 place-items-center">
              <Icon.Calendar width={14} />
              <p className="font-mono">Q1 2023</p>
            </div>
          </div>
          <p className="pb-2 text-zinc-600 dark:text-zinc-400">
            Mobile application and hardware device to calculate nutrition intake
            and provide personalized nutrition
          </p>
        </div>
      </Link>

      <Link
        href={"/projects/ambient-chat"}
        className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
      >
        <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
          <Image
            src="/images/ambient_chat/ambient_chat.webp"
            alt="Image of the Ambient Chat Platform"
            className="w-full max-h-[272px] object-contain transition-all"
            width={350}
            height={250}
          />
        </div>
        <div className="max-w-sm col-span-2">
          <div className="flex items-center">
            <h3 className="text-xl font-medium pb-1">Ambient Chat</h3>
            <Icon.ChevronRight
              size={22}
              className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
            />
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            <div className="flex gap-2 place-items-center">
              <Icon.Calendar width={14} />
              <p className="font-mono">Q2 2022</p>
            </div>
          </div>
          <p className="pb-2 text-zinc-600 dark:text-zinc-400">
            Realtime chat application with artificial intelligence
          </p>
        </div>
      </Link>

      <Link
        href={"/projects/homebility"}
        className="grid grid-cols-5 gap-16 group justify-between items-center max-md:flex max-md:flex-col max-md:gap-4 rounded-md"
      >
        <div className="bg-zinc-100 dark:bg-[#09090b] rounded-md p-2 mb-6 mt-6 md:w-full col-span-3">
          <Image
            src="/images/homebility/homebility.webp"
            alt="Image of the Homebility Mobile App"
            className="w-full max-h-[272px] object-contain transition-all"
            width={350}
            height={250}
          />
        </div>
        <div className="max-w-sm col-span-2">
          <div className="flex items-center">
            <h3 className="text-xl font-medium pb-1">Homebility</h3>
            <Icon.ChevronRight
              size={22}
              className="opacity-0 bottom-0.5 group-hover:opacity-100 transition-all -translate-x-0 group-hover:translate-x-1 relative"
            />
          </div>
          <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            <div className="flex gap-2 place-items-center">
              <Icon.Calendar width={14} />
              <p className="font-mono">Q2 2022</p>
            </div>
          </div>
          <p className="pb-2 text-zinc-600 dark:text-zinc-400">
            Accessible smarthome application with an easy to use interface
          </p>
        </div>
      </Link> */}
    </div>
  )
}

export default Projects
