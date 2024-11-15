import React from 'react';
import styles from './hero.scss';

export default function Hero({
    image = {},
    children
}) {
    return <header
        className={styles.hero}
    >
        <img
            className={styles.image}
            {...image}
        />
        { children }
    </header>
}