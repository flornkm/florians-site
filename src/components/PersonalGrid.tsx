"use client"

import dynamic from "next/dynamic"
import { useState, useCallback, Fragment, useRef } from "react"
import * as Icon from "react-feather"
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import Grid from "@/layout/Grid"
import SortableItem from "@/layout/SortableItem"
import Item from "@/layout/Item"
import { Dialog, Transition } from "@headlessui/react"

export default function PersonalGrid() {
  const globePopupContainer = useRef(null)
  const globeEl = useRef(null)

  const [items, setItems] = useState(
    Array.from({ length: 5 }, (_, i) => (i + 1).toString())
  )
  const [activeId, setActiveId] = useState(null)
  const [globePopup, setGlobePopup] = useState(false)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        tolerance: 5,
        delay: 150,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        tolerance: 5,
        delay: 150,
      },
    })
  )

  const Globe = dynamic(() => import("react-globe.gl"), {
    ssr: false,
  })

  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const handleDragOver = useCallback((event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const closeModal = () => setGlobePopup(false)

  const colorSetting = "red"
  const highlightSetting = "red"
  const arcSetting = "grey"

  const stanLat = 47.74
  const stanLng = 9.5

  const myLocations = [
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Split<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Croatia",
      year: [2022],
      lat: 43.508133,
      lng: 16.440193,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 44.8167,
      endLng: 13.8167,
      color: highlightSetting,
      arcCol: arcSetting,
    },

    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Amsterdam<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Netherlands",
      year: [2019, 2022],
      lat: 52.3667,
      lng: 4.9,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 52.3667,
      endLng: 4.9,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Brussels<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Belgium",
      year: [2022],
      lat: 50.8333,
      lng: 4.3333,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 50.8333,
      endLng: 4.3333,
      color: highlightSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Laax<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Switzerland",
      year: [2022],
      lat: 46.8167,
      lng: 8.9167,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 46.8167,
      endLng: 8.9167,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Novalja<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Croatia",
      year: [2021],
      lat: 44.556181,
      lng: 14.885424,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 45.8153,
      endLng: 15.9665,
      color: colorSetting,
      arcCol: arcSetting,
    },

    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Rhodos<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Greece",
      year: [2021],
      lat: 36.3933,
      lng: 28.0833,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 36.3933,
      endLng: 28.0833,
      color: colorSetting,
      arcCol: arcSetting,
    },

    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Berlin<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Germany",
      year: [2016, 2019],
      lat: 52.52,
      lng: 13.405,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 52.52,
      endLng: 13.405,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">New York<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "United States",
      year: [2018],
      lat: 40.7128,
      lng: -74.0059,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 40.7128,
      endLng: -74.0059,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Bozen<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Italy",
      year: [2016, 2017],
      lat: 46.4986,
      lng: 11.3437,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 46.4986,
      endLng: 11.3437,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Sønderborg<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Denmark",
      year: [2015],
      lat: 55.6667,
      lng: 11.0,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 55.6667,
      endLng: 11.0,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">London<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "United Kingdom",
      year: [2014],
      lat: 51.5074,
      lng: -0.1278,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 51.5074,
      endLng: -0.1278,
      color: colorSetting,
      arcCol: arcSetting,
    },
  ]

  return (
    <>
      <div className="block">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onDragOver={handleDragOver}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <Grid columns={3}>
              {items.map((id) => (
                <SortableItem key={id} id={id} index={items.indexOf(id)} />
              ))}
            </Grid>
          </SortableContext>
          <DragOverlay adjustScale={true}>
            {activeId ? <Item /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <Transition appear show={globePopup} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  ref={globePopupContainer}
                  className="w-full ring-4 ring-white max-w-5xl h-full transform overflow-hidden rounded-2xl bg-gradient-to-t dark:from-[#062130] dark:to-sky-900 from-sky-500 to-sky-400 text-left align-middle shadow-xl transition-all relative min-h-[600px] dark:ring-zinc-800"
                >
                  <Globe
                    ref={globeEl as any}
                    pointsData={myLocations}
                    height={600}
                    // @ts-ignore
                    width={globePopupContainer.current?.offsetWidth as number}
                    showGraticules={true}
                    showGlobe={true}
                    showAtmosphere={false}
                    pointColor={"color"}
                    pointRadius={0.6}
                    pointsTransitionDuration={3500}
                    pointResolution={50}
                    pointAltitude={0.1}
                    backgroundColor={"#00000000"}
                    bumpImageUrl={"./images/globe_image.jpg"}
                    globeImageUrl={"./images/globe_image.jpg"}
                  />

                  <button
                    type="button"
                    className="flex w-10 h-10 justify-center place-items-center rounded-full border border-transparent bg-black text-white absolute text-sm font-medium hover:bg-zinc-900 focus:outline-none right-2 top-2 dark:bg-white dark:hover:bg-zinc-100 dark:text-black"
                    onClick={closeModal}
                  >
                    <Icon.X size={24} />
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
