import Link from "next/link"
import Image from "next/image"
import { allProjects } from "contentlayer/generated"
import * as Icon from "react-feather"

const projects = allProjects.sort((a, b) => {
  if (a.date.includes("Now")) {
    return -1
  } else if (b.date.includes("Now")) {
    return 1
  } else {
    return (
      parseInt(b.date.split(" ")[b.date.split(" ").length - 1]) -
      parseInt(a.date.split(" ")[a.date.split(" ").length - 1])
    )
  }
})

function Projects() {
  return (
    <div className={"flex flex-col gap-8"}>
      {projects.map((project: any) => (
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
                {project.date.includes(" - ") ? (
                  <pre className="font-mono">
                    {`${project.date.split("-")[0]}-${
                      !project.date.split("-")[1].includes("Now")
                        ? project.date.split("-")[1]
                        : " "
                    }`}
                    <span className="font-sans text-green-500 font-medium">
                      {project.date.split("-")[1].includes("Now") && "Now"}
                    </span>
                  </pre>
                ) : (
                  <pre className="font-mono">{project.date}</pre>
                )}
              </div>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {project.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Projects
