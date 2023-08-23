"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Popup from "../template/Popup"
import creations from "../../content/creations.json"

function CreationGrid() {
  const [popupState, setPopupState] = useState(false)

  const currentCreation = useRef({
    collaborators: null as string[] | null,
    title: null as string | null,
    shortDescription: null as string | null,
    icon: null as string | null,
    mainImages: [null, null] as string[] | null[],
    text: null as string | null,
    links: null as Record<string, string>[] | null,
    video: null as string | null,
    videoThumbnail: null as string | null,
  })

  const activatePopup = (creation: Record<string, any>) => {
    // @ts-ignore
    const creationData = creations.data[creation.title] as Record<string, any>

    if (creationData) {
      const {
        collaborators,
        title,
        shortDescription,
        icon,
        video,
        mainImages,
        text,
        links,
        videoThumbnail,
      } = creationData

      currentCreation.current = {
        collaborators,
        title,
        shortDescription,
        icon,
        video,
        mainImages,
        text,
        links,
        videoThumbnail,
      }

      setPopupState(true)
    }
  }

  return (
    <>
      <div className="flex flex-col items-left justify-left h-full pt-32 max-md:pt-16 mb-8">
        <h1 className="text-3xl font-semibold text-left mb-3">Creations</h1>
        <h2 className="text-xl text-left text-zinc-500">
          A selection of ideas, concepts and more.
        </h2>
      </div>
      <div className="min-h-96 grid grid-cols-3 w-full gap-4 max-md:grid-cols-1 max-lg:grid-cols-2 pb-32">
        {creations.previews.map((creation, index) => (
          <div
            key={index}
            onClick={() => {
              activatePopup(creation)
            }}
            className={
              "bg-transparent rounded-2xl flex h-full w-full " +
              (creation.title === "Granny AI"
                ? "md:col-span-2 md:row-span-2"
                : "")
            }
          >
            <div className="cursor-pointer transition-all h-full group dark:hover:bg-opacity-80 hover:bg-opacity-80 bg-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:bg-[#09090b] w-full flex flex-col gap-4 max-md:justify-center md:justify-end px-4 py-3 rounded-lg group">
              <Image
                src={creation.preview ? creation.preview : creation.icon}
                alt="Nutri Blueprint Icon"
                className="rounded-xl w-full transition-all"
                width={500}
                height={300}
              />
              <div>
                <p className="text-base font-medium text-ellipsis transition-all text-black dark:text-white">
                  {creation.title}
                </p>
                <p className="text-sm text-ellipsis transition-all text-zinc-500 dark:text-zinc-400">
                  {creation.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Popup
        collaborators={currentCreation.current.collaborators || []}
        popupState={popupState}
        setPopupState={setPopupState}
        icon={currentCreation.current.icon || ""}
        name={currentCreation.current.title || ""}
        shortDescription={currentCreation.current.shortDescription || ""}
        // @ts-ignore
        mainImages={currentCreation.current.mainImages || []}
        text={currentCreation.current.text || ""}
        // @ts-ignore
        links={currentCreation.current.links || []}
        video={currentCreation.current.video || ""}
        videoThumbnail={currentCreation.current.videoThumbnail || ""}
      />
    </>
  )
}

export default CreationGrid
