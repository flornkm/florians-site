import React, { FC } from 'react';

const Grid = ({ children, columns }) => {
    return (
        <div className={"grid grid-cols-3 grid-rows-2 gap-4 max-w-80rem md:h-[500px] max-md:min-h-screen max-md:grid-cols-1"}>
            {children}
        </div>
    );
};

export default Grid;
