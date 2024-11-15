# Rhombic

A 3d maze inside a rhombic dodecahedral honeycomb - one day it'll be a full game!

## Concept

The maze generated inside the honeycomb is incredibly disorienting, as such it makes a perfect starting point for some kind of exploration/mining/stealth(?) game.

### Note

This document was likely out of date when it was written and most definitely is now, take everything below with a pinch of salt.

## TODOs

Thing TODO to bring this from demo to game:

- engine improvements: better collisions and general physics
- optimisation: improve rendering/physics performance, for example combining the "wall" geometries into a single mesh (this should also fix certain lighting glitches)
- puzzles/contents: stuff to go inside previously mentioned rooms, as well as randomly dispersed around the maze, bare minimum is some kind of simple win condition
- UI: needs menus and screens, bare minimum would be a "click to start" screen and a "you win/lose" screen
- dev tooling/wizard mode: need some way to easily build and debug stuff like maze generation and content items

## Roadmap

As well as hitting the main TODOs I also intend to try to add the following for a "fuller" experience:

- rooms: predefined sets of cells that make "corridors", "halls" and such
- different equipment: allow users to select a "ship" to use when navigating, with each having unique strengths/weaknesses
- pickups: collect items inside the maze to increase users power (e.g. a map, a drill (to remove walls), health/energy refills)