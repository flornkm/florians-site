import React, { forwardRef, HTMLAttributes, CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import * as Icon from "react-feather";

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
            class="h-full w-full object-cover opacity-100 hover:opacity-80 transition-all"
            width={800}
            height={index === 1 || index === 2 ? 600 : 300}
            />
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
