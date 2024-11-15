import React from 'react';
import styles from './navbar.scss';

export default function Navbar({ navitems = [] }) {
    return <nav
        className={styles.nav}
    >{
        navitems.map(item => item
                ? <a
                    key={
                        item.text
                        ? item.text
                        : item
                    }
                    href={
                        item.href
                        ? item.href
                        : `#${item.toLowerCase()}
                    `}
                >{
                    item.text
                    ? item.text
                    : item
                }</a>
                : null // TODO throw?
        )
    }</nav>
}