import React, { useMemo } from 'react';
import Hero from './hero';
import Navbar from './navbar';

import '../../css/index.scss';
import ImageText from './content-types/image-text';
import CalloutText from './content-types/callout-text';
import Columns from './content-types/columns';


const images = [
    {
        src: './img/van4.jpg',
        alt: 'photo of van interior',
    },
    {
        src: './img/van1.jpg',
        alt: 'photo of van',
    },
    {
        src: './img/van2.jpg',
        alt: 'another photo of van',
    },
    {
        src: './img/van3.jpg',
        alt: 'another photo of van',
    },
    {
        src: './img/van5.jpg',
        alt: 'another photo of van',
    }
]


export default function App() {
    return <>
        <Navbar navitems={[{text: 'home', href: '/'}]}/>
        <Hero
            image={images[0]}
        >
            <h1>Seamless verticals</h1>
            <h2>Big data top influencers leverage buzzword. Inbound verticals reaching out phablet emerging.</h2>
            <p><a href="//example.com">call to action</a></p>
        </Hero>
        <ImageText
            image={images[1]}
        >
            <h2>Inbound emerging hackathon social influencer</h2>
            <h3>thought leadership millennials.</h3>
            <p>
                Lean content context engagement optimized for social sharing leverage. Hit the like button customer engagement target audience emerging market share. SEO mobile ready shoptimization target audience thought leadership content marketing.
            </p>
            <p><a href="//example.com">call to action</a></p>
        </ImageText>
        <CalloutText>
            <h2>Alignment crowdsource wearables flat design</h2>
            <h3>Click bait CRM drone quiet period pivot, reaching out social influencer.</h3>
            <p>
                Lean content context engagement optimized for social sharing leverage. Hit the like button customer engagement target audience emerging market share. SEO mobile ready shoptimization target audience thought leadership content marketing.
            </p>
            <p><a href="//example.com">call to action</a></p>
        </CalloutText>
        <Columns
            title="Shoptimization synergies content curation"
        >
            <>
                <h3>conversions optimized for social sharing blogosphere</h3>
                <p>
                    Leading the pack wheelhouse long-tail council. Holistic content marketing dynamic content flat design CRM call-to-action disrupt.
                    <img {...images[2]} />
                </p>
                <p><a href="//example.com">call to action</a></p>
            </>
            <>
                <h3>Low hanging fruit social buttons dynamic content.</h3>
                <p>
                    Curated ROI goals for engagement CRM leading the pack content marketing. Iterative robust leading the pack mission critical.
                    <img {...images[3]} />
                </p>
                <p><a href="//example.com">call to action</a></p>
            </>
            <>
                <h3 id="organicreach">Organic reach</h3>
                <p>
                    Alignment crowdsource wearables flat design target influencer responsive. Big data hit the like button wheelhouse reaching out.
                    <img {...images[4]} />
                </p>
                <p><a href="//example.com">call to action</a></p>
            </>
        </Columns>
    </>
}