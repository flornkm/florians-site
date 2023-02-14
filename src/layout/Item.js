import React, { forwardRef, HTMLAttributes, CSSProperties } from 'react';
import * as Icon from 'react-feather';

const Item = forwardRef(({ id, index, withOpacity, isDragging, style, ...props }, ref) => {
    const inlineStyles = {
        opacity: withOpacity ? '0.5' : '1',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging  ? 'rgb(0 0 0 / 0.1) 0 2px 4px -2px' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        backgroundSize: 'contain',
        ...style,
    };

    return id === "1" && <div ref={ref} style={inlineStyles} class={"row-span-" + (index === 1 || index === 2 ? "2 " : "1 ") + "border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"} {...props}>
            Earth {index}
            <Icon.Globe size={40} class="p-2 bg-green-500 text-white rounded-lg absolute top-2 right-2" />
            </div> ||
            id === "2" && <div ref={ref} style={inlineStyles} class={"row-span-" + (index === 1 || index === 2 ? "2 " : "1 ") + "border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"} {...props}>
            Photos {index}
            <Icon.Image size={40} class="p-2 bg-purple-500 text-white rounded-lg absolute top-2 right-2" />
            </div> ||
            id === "3" && <div ref={ref} style={inlineStyles} class={"row-span-" + (index === 1 || index === 2 ? "2 " : "1 ") + "border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"} {...props}>
            Recommends {index}
            <Icon.Paperclip size={40} class="p-2 bg-blue-500 text-white rounded-lg absolute top-2 right-2" />
            </div> ||
            id === "4" && <div ref={ref} style={inlineStyles} class={"row-span-" + (index === 1 || index === 2 ? "2 " : "1 ") + "border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"} {...props}>
            Music {index}
            <Icon.Music size={40} class="p-2 bg-red-500 text-white rounded-lg absolute top-2 right-2" />
            </div> ||
        id !== "1" && <div ref={ref} style={inlineStyles} class={"row-span-" + (index === 1 || index === 2 ? "2 " : "1 ") + "border-gray-200 relative bg-gray-50 border w-full h-full items-center justify-center flex rounded-xl"} {...props}>
            {id}
        </div>;
});

export default Item;
