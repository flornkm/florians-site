"use client"

import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { useCallback } from "react"
import * as Icon from "react-feather"
import Tag from "./Tag"
import { Markdown } from "@/markdown/parseMarkdown"

const Project = ({ project }: { project: Record<string, any> }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  })

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )

  const scrollBack = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )

  return (
    <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16">
      <h1 className="text-4xl font-semibold text-left mb-3">{project.title}</h1>
      <h2 className="text-2xl font-medium text-left text-zinc-500 mb-5 dark:text-zinc-400">
        {project.shortDescription}
      </h2>
      {!project.collaborators && <div className="h-4"></div>}
      {project.collaborators && (
        <div className="mb-10 flex gap-4 place-items-center">
          <p className="text-xl font-medium">Collaborators:</p>
          {project.collaborators.includes("Anton") && (
            <Link
              href={"https://www.antonstallboerger.com/"}
              target="_blank"
              className="group relative transition-all"
            >
              <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                <span className="z-10 relative">Anton Stallbörger</span>
                <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
              </div>
              <Image
                src="/images/people/anton_stallboerger.jpg"
                alt="Anton Stallbörger"
                className="inline-flex ring-1 ring-zinc-300 dark:ring-zinc-700 object-cover object-center max-h-128 rounded-full"
                width={48}
                height={48}
              />
            </Link>
          )}
          {project.collaborators.includes("Nils") && (
            <Link
              href={"https://www.nilseller.com/"}
              target="_blank"
              className="group relative transition-all"
            >
              <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                <span className="z-10 relative">Nils Eller</span>
                <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
              </div>
              <Image
                src="/images/people/nils_eller.jpg"
                alt="Nils Eller"
                className="inline-flex ring-1 ring-zinc-300 dark:ring-zinc-700 object-cover object-center max-h-128 rounded-full"
                width={48}
                height={48}
              />
            </Link>
          )}
          {project.collaborators.includes("Alice") && (
            <Link
              href={"https://www.alicesopp.com/"}
              target="_blank"
              className="group relative transition-all"
            >
              <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                <span className="z-10 relative">Alice Sopp</span>
                <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
              </div>
              <Image
                src="/images/people/alice_sopp.jpg"
                alt="Alice Sopp"
                className="inline-flex ring-1 ring-zinc-300 dark:ring-zinc-700 object-cover object-center max-h-128 rounded-full"
                width={48}
                height={48}
              />
            </Link>
          )}
        </div>
      )}
      <Image
        src={project.banner}
        alt={"Project Banner Image for " + project.title}
        className="inline-flex object-cover object-center max-h-128 mb-10 bg-zinc-100 dark:bg-[#09090b] rounded-lg"
        width={1200}
        height={500}
      />
      <div className="flex gap-2 mb-10 flex-wrap">
        {project.tags.map((tag: string, index: number) => (
          <Tag key={index}>
            <p>{tag}</p>
          </Tag>
        ))}
      </div>
      <p className="text-zinc-700 md:max-w-[80%] text-lg mb-32 dark:text-zinc-300">
        {project.description}
      </p>
      <div className="relative min-h-[600px] max-sm:min-h-[500px]">
        <div className="absolute w-[99vw] translate-x-[-50%] left-[50%] cursor-grab active:cursor-grabbing">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {project.slideImages &&
                project.slideImages.map((slideImage: string, index: number) => (
                  <div className="embla__slide" key={index}>
                    <div className="embla__slide__inner">
                      <Image
                        alt={"Slide Image " + index + " for " + project.title}
                        src={slideImage}
                        className="inline-flex object-cover object-center mb-2 max-md:object-contain"
                        width={1000}
                        height={800}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex gap-4 mt-8 w-full justify-end max-w-5xl max-md:pr-[10%] md:pr-[2%] mx-auto">
            <div className="flex gap-4">
              <Icon.ArrowLeft
                size={40}
                onClick={scrollBack}
                className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full cursor-pointer hover:bg-zinc-700 transition-all"
              />
              <Icon.ArrowRight
                size={40}
                onClick={scrollNext}
                className="p-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full cursor-pointer hover:bg-zinc-700 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
      <Markdown type="project">{project.body.code}</Markdown>
      <div className="h-32"></div>
    </div>
  )
}

export default Project
