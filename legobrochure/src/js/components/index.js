import React, { useMemo } from 'react';
import Hero from './hero';
import Navbar from './navbar';

import '../../css/index.scss';

export default function App() {
    return <>
        <Navbar navitems={[{text: 'home', href: '/'}]}/>
        <Hero
            image={useMemo(() => ({
                src: './img/van4.jpg',
                alt: 'photo of van interior',
            }))}
        >
            <h1>Seamless verticals</h1>
            <h2>Big data top influencers leverage buzzword. Inbound verticals reaching out phablet emerging.</h2>
            <p><a href="//example.com">call to action</a></p>
        </Hero>
    </>
}