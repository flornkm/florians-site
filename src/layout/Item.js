import React, { forwardRef, HTMLAttributes, CSSProperties } from 'react';
import * as Icon from 'react-feather';

const Item = forwardRef(({ id, withOpacity, isDragging, style, ...props }, ref) => {
    const inlineStyles = {
        opacity: withOpacity ? '0.5' : '1',
        cursor: isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging  ? 'rgb(0 0 0 / 0.1) 0 2px 4px -2px' : 'none',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        ...style,
    };

    return <div ref={ref} style={inlineStyles} class="border-gray-200 relative bg-gray-50 border w-[19rem] h-[19rem] items-center justify-center flex rounded-xl" {...props}>
        {id === "1" && <div>
            Music
            <Icon.Music size={40} class="p-2 bg-red-500 text-white rounded-lg absolute top-2 right-2" />
        </div>}
        {id !== "1" && <div>
            {id}
        </div>}
        </div>;
});

export default Item;
