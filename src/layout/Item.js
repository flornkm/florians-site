import React, { forwardRef, HTMLAttributes, CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import * as Icon from "react-feather";
import Popup from "@/components/Popup";

const Item = forwardRef(
  ({ id, index, withOpacity, isDragging, style, ...props }, ref) => {
    const inlineStyles = {
      opacity: withOpacity ? "0.5" : "1",
      cursor: isDragging ? "grabbing" : "grab",
      boxShadow: isDragging ? "rgb(0 0 0 / 0.1) 0 2px 4px -2px" : "none",
      transform: isDragging ? "scale(1.05)" : "scale(1)",
      backgroundSize: "cover",
      gridRow:
        index === 1 || index === 2 ? "span 2 / span 2" : "span 1 / span 1",
      ...style,
    };

    const Globe = dynamic(() => import("react-globe.gl"), {
      ssr: false,
    });

    const colorSetting = "red";
    const highlightSetting = "red";
    const arcSetting = "grey";

    const stanLat = 47.74;
    const stanLng = 9.5;

    const myLocations = [
      {
        name: '<p class="label">New York</p>',
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
        name: '<p class="label">London</p>',
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
        name: '<p class="label">Novalja</p>',
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
        name: '<p class="label">Berlin</p>',
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
        name: '<p class="label">Rhodos</p>',
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
        name: '<p class="label">Sønderborg</p>',
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
        name: '<p class="label">Bozen</p>',
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
        name: '<p class="label">Laax</p>',
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
        name: '<p class="label">Amsterdam</p>',
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
        name: '<p class="label">Brussels</p>',
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
        name: '<p class="label">Split</p>',
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
      (id === "1" && (
        <div
          ref={ref}
          style={inlineStyles}
          class={
            "max-md:row-span-1 ring-gray-200 ring-1 relative bg-gray-50 border w-full h-full items-center justify-center flex flex-col rounded-xl max-md:min-h-[300px] overflow-hidden"
          }
          {...props}
        >
          <Image
            src="/images/maps.svg"
            alt="Maps Vector"
            class="h-full w-full object-cover bg-cover cursor-pointer"
            width={800}
            height={index === 1 || index === 2 ? 600 : 300}
            />

        <Popup />
          <Icon.Globe
            size={40}
            class="p-2 shadow-sm bg-gradient-to-t from-green-500 to-emerald-500 text-white rounded-lg absolute top-2 right-2"
          />
        </div>
      )) ||
      (id === "2" && (
        <div
          ref={ref}
          style={inlineStyles}
          class={
            "max-md:row-span-1 border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px]"
          }
          {...props}
        >
          Photos {index}
          <Icon.Image
            size={40}
            class="p-2 shadow-sm bg-gradient-to-t from-purple-500 to-violet-500 text-white rounded-lg absolute top-2 right-2"
          />
        </div>
      )) ||
      (id === "3" && (
        <div
          ref={ref}
          style={inlineStyles}
          class={
            "max-md:row-span-1 border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px]"
          }
          {...props}
        >
          Recommends {index}
          <Icon.Paperclip
            size={40}
            class="p-2 shadow-sm bg-gradient-to-t from-blue-500 to-sky-500 text-white rounded-lg absolute top-2 right-2"
          />
        </div>
      )) ||
      (id === "4" && (
        <div
          ref={ref}
          style={inlineStyles}
          class={
            "max-md:row-span-1 border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px]"
          }
          {...props}
        >
          Music {index}
          <Icon.Music
            size={40}
            class="p-2 shadow-sm bg-gradient-to-t from-red-500 to-rose-500 text-white rounded-lg absolute top-2 right-2"
          />
        </div>
      )) ||
      (id !== "1" && (
        <div
          ref={ref}
          style={inlineStyles}
          class={
            "max-md:row-span-1 border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"
          }
          {...props}
        >
          {id}
        </div>
      ))
    );
  }
);

export default Item;
