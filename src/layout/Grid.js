import React, { FC } from 'react';

const Grid = ({ children, columns }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridGap: "1rem",
                maxWidth: '80rem',
            }}
        >
            {children}
        </div>
    );
};

export default Grid;
