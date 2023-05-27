import Head from "next/head";
import dynamic from "next/dynamic";
import { NextSeo } from "next-seo";
import * as React from "react";
import { useState, useCallback, Fragment } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RiveComponent from "@rive-app/react-canvas";
import Image from "next/image";
import Link from "next/link";
import * as Icon from "react-feather";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import Grid from "@/layout/Grid";
import SortableItem from "@/layout/SortableItem";
import Item from "@/layout/Item";
import { Dialog, Transition } from "@headlessui/react";

export default function Home() {
  const title = "Designer and Developer";
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };
  const highlight = "About";

  const globePopupContainer = React.useRef(null);
  const globeEl = React.useRef(null);

  const [items, setItems] = useState(
    Array.from({ length: 5 }, (_, i) => (i + 1).toString())
  );
  const [activeId, setActiveId] = useState(null);
  const [globePopup, setGlobePopup] = useState(false);
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
  );

  const Globe = dynamic(() => import("react-globe.gl"), {
    ssr: false,
  });

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleDragOver = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const closeModal = () => setGlobePopup(false);

  const colorSetting = "red";
  const highlightSetting = "red";
  const arcSetting = "grey";

  const stanLat = 47.74;
  const stanLng = 9.5;

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
  ];

  return (
    <>
      <NextSeo
        title="About - Florian"
        description="Here you can find out more about me and my work."
        openGraph={{
          url: 'floriandwt.com',
          title: 'About - Florian',
          description: 'Here you can find out more about me and my work.',
          images: [
            {
              url: '/images/florian_opengraph.jpg',
              width: 800,
              height: 600,
              alt: 'Florian - Digtital Product Designer',
              type: 'image/jpeg',
            }
          ],
          siteName: 'Florian - Digtital Product Designer',
        }}
        twitter={{
          handle: '@floriandwt',
          site: '@floriandwt',
          cardType: 'summary_large_image',
        }}
      />
      <Navigation title={title} highlight={highlight} />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#101012] dark:text-white">
        <div className="h-40 max-md:h-24" />
        {/* <div className="w-full md:pt-20 pb-4 max-md:h-[200px] relative z-0">
          <RiveComponent
            src="./animations/florian_animation.riv"
            className="max-w-[500px] max-md:h-64 md:h-[200px] object-contain m-auto"
          />
        </div> */}
        <div className="gap-0 grid grid-cols-2 max-md:flex max-md:flex-col max-md:gap-0 mb-8">
          <div className="flex gap-8 max-lg:flex-col max-md:gap-4 max-w-lg row-span-1 max-md:order-2 max-md:mb-24 md:pt-4 md:pb-16">
            <div className="justify-center flex flex-col">
              <h1 className="text-xl font-semibold mb-3">About me</h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-2">
                My name is Flo and I am currently &nbsp;
                { new Date().getFullYear() - 2001 }
                &nbsp; years old. I am a
                designer and developer and I love to create beautiful
                products. Currently I am studying at the Hochschule fuer
                Gestaltung, also known as just HfG, in Schwaebisch Gmuend,
                Germany.
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                Beside my desire to work between design and code I love working
                with CSS and creating animations for web and mobile applications.
              </p>

            </div>
          </div>
          <div className="row-span-2 order-first">
            <Image
              loader={imgLoader}
              src="./images/florian_student.jpg"
              className="inline-flex object-cover mb-12 object-top max-h-96 rounded-lg max-md:w-40 max-md:h-40 first-chil max-md:rounded-full max-md:ring-1 max-md:ring-zinc-300 relative z-10 row-span-2 h-full"
              width={300}
              height={200}
            />
            <div className="flex flex-col gap-4 max-md:hidden">
              <h2 className="font-medium text-lg">Let's connect</h2>
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
            <h2 className="font-medium text-lg">Work</h2>
            <Link href="https://meta-hype.com/" target="_blank" className="flex items-center w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_metahype.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Digital Strategist and Designer
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Metahype</p>
                </div>
              </div>
              <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">2020 - <span className="text-green-500 font-sans font-medium">Now</span></p>
            </Link>
            <Link href="https://www.hfg-gmuend.de/" target="_blank" className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_hfg.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Webdesign Tutor
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    HfG Schwaebisch Gmuend
                  </p>
                </div>
              </div>
              <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">2022</p>
            </Link>
            <div className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_comondo.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Webdesigner & -developer
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Comondo</p>
                </div>
              </div>
              <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">2020 - 2021</p>
            </div>
            <div className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_videoeditor.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1 bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Videoeditor and Motion Designer
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Freelance</p>
                </div>
              </div>
              <p className="text-zinc-500 text-right text-xs font-mono dark:text-zinc-400">2015 - 2020</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 order-4 col-start-2">
            <h2 className="font-medium text-lg">Side projects</h2>
            <Link href="https://bridge.supply/" target="_blank" className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/project_bridge.jpg"
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
            <Link href="https://curations.tech/" target="_blank" className="flex w-full gap-2 justify-between px-3 py-2 -ml-3 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/project_curations.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-zinc-100 p-1.5 bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">Curations</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Website featuring useful curations for designers and
                    developers
                  </p>
                </div>
              </div>
            </Link>
          </div>

        </div>
        <div className="h-32"></div>
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
                  <SortableItem
                    key={id}
                    id={id}
                    index={items.indexOf(id)}
                    onClick={() => {
                      id === "1" && setGlobePopup(true);
                    }}
                  />
                ))}
              </Grid>
            </SortableContext>
            <DragOverlay adjustScale={true}>
              {activeId ? <Item id={activeId} isDragging /> : null}
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
                    <div className="absolute flex flex-col top-8 left-8 gap-1 text-white dark:text-sky-200 max-lg:hidden">
                      <p className="font-medium text-lg mb-2">Some of the places I visited:</p>
                      {myLocations.map((location) => (
                        <div className="flex gap-2">
                          {location.name.replace(/<\/?[^>]+(>|$)/g, "") + ", " +
                            location.country}
                            <div className="flex gap-0.5">
                          {location.year.map((year) => (
                            // if its not the last, put a comma after
                            // <span className="font-mono text-xs flex gap-1 font-normal">{year}</span>
                            year === location.year[location.year.length - 1] ? (
                              <span className="font-mono text-xs flex font-normal">
                                {year}
                              </span>
                            ) : (
                              <span className="font-mono text-xs flex font-normal">
                                {year + ","}
                              </span>
                            )
                          ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Globe
                      ref={globeEl}
                      pointsData={myLocations}
                      height={600}
                      width={globePopupContainer.current?.offsetWidth}
                      showGraticules={true}
                      showGlobe={true}
                      showAtmosphere={false}
                      pointColor={"color"}
                      pointRadius={[0.6]}
                      pointsTransitionDuration={[3500]}
                      pointResolution={[50]}
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
        <div className="h-32"></div>
      </main>
      <Footer />
    </>
  );
}
