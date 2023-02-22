import Head from "next/head";
import dynamic from "next/dynamic";
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
    Array.from({ length: 4 }, (_, i) => (i + 1).toString())
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">New York<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "United States",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">London<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "United Kingdom",
      lat: 51.5074,
      lng: -0.1278,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 51.5074,
      endLng: -0.1278,
      color: colorSetting,
      arcCol: arcSetting,
    },
    {
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Novalja<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Croatia",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Berlin<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Germany",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Rhodos<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Greece",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Sønderborg<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Denmark",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Bozen<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Italy",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Laax<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Switzerland",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Amsterdam<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Netherlands",
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
      name: '<p class="bg-black text-white px-2 py-0 rounded-full relative">Split<div class="h-2 w-2 bg-black absolute -top-1 translate-x-[-50%] left-[50%] rotate-45"></div></p>',
      country: "Croatia",
      lat: 43.508133,
      lng: 16.440193,
      startLat: stanLat,
      startLng: stanLng,
      endLat: 44.8167,
      endLng: 13.8167,
      color: highlightSetting,
      arcCol: arcSetting,
    },
  ];

  return (
    <>
      <Head>
        <title>About Florian | Design With Tech</title>
        <meta
          name="description"
          content="Designer and Developer building digital products."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Combining Design and Technology | Design With Tech"
        />
        <meta
          property="og:description"
          content="Designer and Developer building digital products."
        />
        <meta
          property="og:image"
          content="/images/designwithtech_opengraph.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@floriandwt" />
        <meta name="twitter:title" content="Florian Portfolio" />
        <meta
          name="twitter:image"
          content="/images/designwithtech_twitter.jpg"
        />
        <meta
          name="twitter:description"
          content="Designer and Developer building digital products."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation title={title} highlight={highlight} />
      <main className="max-md:w-[90%] min-h-[100vh] w-full max-w-6xl pl-[5%] pr-[5%] m-auto bg-white dark:bg-[#080D14] dark:text-white">
        <div className="w-full md:pt-20 pb-4 max-md:h-[200px] relative z-0">
          <RiveComponent
            src="./animations/florian_animation.riv"
            className="max-w-[500px] max-md:h-64 md:h-[200px] object-contain m-auto"
          />
        </div>
        <div className="gap-16 grid grid-cols-2 max-md:grid-cols-1">
          <div>
            <div className="flex gap-8 mb-6 max-lg:flex-col max-md:gap-4">
              <Image
                loader={imgLoader}
                src="./images/florian_student.jpg"
                className="inline-flex object-cover object-top max-h-64 max-md:w-20 max-md:h-20 max-md:rounded-full max-md:ring-1 max-md:ring-gray-300 relative z-10"
                width={200}
                height={100}
              />
              <div>
                <h1 className="text-2xl font-semibold mb-3">About me</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold italic text-black dark:text-white">
                    Nice to meet you!
                  </span>{" "}
                  - My name is Florian and I am currently 22 years old. I am a
                  designer and developer and I love to create beautiful
                  products. Currently I am studying at the Hochschule fuer
                  Gestaltung, also known as just HfG, in Schwaebisch Gmuend,
                  Germany.
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Beside my desire to work between design and code I love working
              with CSS and creating animations for web and mobile applications.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="font-medium text-lg">Work</h2>
            <div className="flex w-full justify-between">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_metahype.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-gray-200 p-1 dark:bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Digital Strategist and Designer
                  </h3>
                  <p className="text-sm text-gray-500">Metahype</p>
                </div>
              </div>
              <p className="text-gray-500 text-right">2020 - present</p>
            </div>
            <div className="flex w-full justify-between">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_hfg.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-gray-200 p-1 dark:bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Webdesigner and Developer
                  </h3>
                  <p className="text-sm text-gray-500">
                    HfG Schwaebisch Gmuend
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-right">2022</p>
            </div>
            <div className="flex w-full justify-between">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_comondo.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-gray-200 p-1 dark:bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Digital Strategist and Designer
                  </h3>
                  <p className="text-sm text-gray-500">Comondo</p>
                </div>
              </div>
              <p className="text-gray-500 text-right">2020 - 2021</p>
            </div>
            <div className="flex w-full justify-between">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/company_videoeditor.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-gray-200 p-1 dark:bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">
                    Videoeditor and Motion Designer
                  </h3>
                  <p className="text-sm text-gray-500">Freelance</p>
                </div>
              </div>
              <p className="text-gray-500 text-right">2015 - 2020</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="font-medium text-lg">Side projects</h2>
            <div className="flex w-full justify-between">
              <div className="flex gap-2 place-items-center ">
                <Image
                  loader={imgLoader}
                  src="./images/project_curations.jpg"
                  className="block flex-shrink-0 relative object-contain object-center rounded-full border border-gray-200 p-1 dark:bg-white"
                  width={40}
                  height={40}
                />
                <div>
                  <h3 className="font-medium text-md">Curations</h3>
                  <p className="text-sm text-gray-500">
                    Website featuring useful curations for designers and
                    developers
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-medium text-lg">Connect</h2>
            <div className="flex gap-4 max-sm:flex-col">
              <Link
                className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                href={"https://read.cv/floriandwt"}
                target="_blank"
              >
                Read.cv
                <Icon.ArrowUpRight
                  size={20}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
              <Link
                className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                href={"https://github.com/floriandwt"}
                target="_blank"
              >
                GitHub
                <Icon.ArrowUpRight
                  size={20}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
              <Link
                className="font-medium transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                href={"https://www.linkedin.com/in/floriandwt/"}
                target="_blank"
              >
                LinkedIn
                <Icon.ArrowUpRight
                  size={20}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
            </div>
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
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                    className="w-full ring-4 ring-white max-w-5xl h-full transform overflow-hidden rounded-2xl bg-gradient-to-t from-sky-400 to-sky-300 text-left align-middle shadow-xl transition-all relative min-h-[600px] dark:ring-gray-800"
                  >
                    <Globe
                      ref={globeEl}
                      pointsData={myLocations}
                      height={600}
                      width={globePopupContainer.current?.offsetWidth}
                      showGraticules={true}
                      showGlobe={true}
                      showAtmosphere={true}
                      atmosphereAltitude={0.5}
                      atmosphereColor="#a3f0ff"
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
                      className="flex w-10 h-10 justify-center place-items-center rounded-full border border-transparent bg-black text-white absolute text-sm font-medium hover:bg-gray-900 focus:outline-none right-2 top-2 dark:bg-white dark:hover:bg-gray-100 dark:text-black"
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
