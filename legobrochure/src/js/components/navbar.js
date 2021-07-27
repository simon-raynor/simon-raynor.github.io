import React from 'react';

export default function Navbar({ navitems = [] }) {
    return <nav>{
        navitems.map(item => item
                ? <a
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