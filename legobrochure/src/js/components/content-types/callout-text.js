import React from 'react';
import styles from './callout-text.scss';

export default function CalloutText({ children }) {
    return <section
        className={styles.section}
    >{
        children
    }</section>
}