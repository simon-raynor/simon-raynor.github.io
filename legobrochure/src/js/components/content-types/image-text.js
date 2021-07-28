import React from 'react';
import styles from './image-text.scss';

export default function ImageText({
    image = {},
    reverse,
    children
}) {
    return <section
        className={[
            styles.section,
            reverse ? styles.reverse : ''
        ].join(' ')}
    >
        <img
            className={styles.image}
            src={image.src}
            alt={image.alt}
        />
        <div>{
            children
        }</div>
    </section>
}