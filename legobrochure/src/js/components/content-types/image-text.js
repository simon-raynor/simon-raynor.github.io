import React from 'react';

export default function ImageText({
    imgSrc,
    imgAlt,
    reverse,
    children
}) {
    return <section>
        <img
            src={imgSrc}
            alt={imgAlt}
        />
        <div>{
            children
        }</div>
    </section>
}