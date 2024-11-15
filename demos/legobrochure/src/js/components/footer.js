import React from 'react';
import styles from './footer.scss';

export default function Footer({ children }) {
    return <footer
        className={styles.footer}
    >{
        children
    }</footer>
}