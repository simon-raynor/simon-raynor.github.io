import React from 'react';

export default function Hero({
    title = 'TITLE',
    subtitle = 'SUBTITLE',
    cta
}) {
    return <header>
        <h1>{ title }</h1>
        <h2>{ subtitle }</h2>
    </header>
}