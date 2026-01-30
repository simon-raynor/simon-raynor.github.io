# simon-raynor.github.io

My personal site. I try not to mess it up too bad.

## TODO

### here

- the build tooling could be nicer
    - GH workflows for the build maybe?
- mindblown update
    - mouse interactivity
        - things you can drag around which attract/repel scrollies
            - it could have, like, a little game or challenge
    - escape button/a11y mode
        - kind of done w/ the pause button but could be better
        - at least put a `<noscript>` with an explanation
    - `prefers-reduced-motion: reduce` media query
        - not sure what it should do, may need to consult with actually affected people
    - more scrollies
        - seasonal
            - bats
            - hearts
            - snowflakes?
            - birthday presents
        - platonic solids
        - 3d?
        - javascroids?
        - trider?
- fix playbutton demo scaling on mobile
- contact form of some sort
    - don't wanna have to pay for a server but I might have to
- more demos
- case studies/writeups?

### elsewhere 

- work on rhombic
    - game needs a purpose
    - reintegrate the particle paths that made it feel alive
- learn webassembly/more c++
- real world shiz

## Scripts

Dev (built in server etc.):

```
npx vite
```

Prod:

```
npx vite build
```

Push dist directory to gh-pages branch

```
git subtree push --prefix dist origin gh-pages
```