import React from 'react';
import Hero from './hero';
import Navbar from './navbar';

export default function App() {
    return <>
        <Navbar navitems={[{text: 'home', href: '/'}]}/>
        <Hero />
    </>
}