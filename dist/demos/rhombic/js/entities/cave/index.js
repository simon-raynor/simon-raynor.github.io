import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { LoopSubdivision } from 'three-subdivide';

import { RHOMBIC_FACES_2D, RHOMBIC_VERTICES } from '../../geometries/rhombicdodecahedron.js';
import Pathfinder from '../Pathfinder/index.js';
import generateSurfaceGrid from './surface.js';

const tmpVec3 = new THREE.Vector3();
const raycaster = new THREE.Raycaster();


export const CAVESCALE = 25;

const GRID_DIRECTIONS = [
    [1, 1, 0],
    [1, 0, 1],
    [1, -1, 0],
    [1, 0, -1],

    [-1, -1, 0],
    [-1, 0, 1],
    [-1, 1, 0],
    [-1, 0, -1],

    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1]
];

const INITIAL_TUNNEL_DIRS = [ 8, 9, 10, 11];


const texture = new THREE.TextureLoader().load('./img/noise1.png');
const texturebump = new THREE.TextureLoader().load('./img/noise2.png');

export const blockMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    bumpMap: texturebump,
    bumpScale: 1,
    side: THREE.BackSide,
    transparent: false
});


export class Cave {
    scale = CAVESCALE;
    constructor(dimension) {
        const [ grid, centre ] = generateLattice(dimension);
        this.centre = centre;
    
        this.chunks = generateTunnel(grid, this.centre);

        this.chunks.forEach(chunk => chunk.setCave(this));

        this.geometry = generateGeometry(this.chunks);

        this.mesh = new THREE.Group();
        this.chunks.forEach(chunk => this.mesh.add(chunk.mesh));


        this.surfaceGrid = generateSurfaceGrid(this);


        //this.pathfinder = new Pathfinder(this, generatePFNodes(this.mesh.geometry));

    
        /* const deadends = [];
        tunnel.forEach(
            chunk => {
                if (chunk.openings.length === 1) {
                    deadends.push(chunk);
                }
            }
        ); */
    
    
        const paths = [];
    }
}


class Chunk {
    filled = true;
    surfaceGrid = [];

    constructor(posn) {
        this.position = posn;
    }

    setCave(cave) {
        this.cave = cave;
        this.worldposition = this.position.clone().multiplyScalar(cave.scale);
        this.paths = new Map();
    }

    findNeighbours(chunks) {
        this.neighbours = [];

        const dirs = GRID_DIRECTIONS.map(
            gdir => tmpVec3.set(...gdir).multiplyScalar(2).add(this.position).clone()
        );

        chunks.forEach(
            chunk => {
                const idx = dirs.findIndex(
                    dir => dir.equals(chunk.position)
                );

                if (idx >= 0) {
                    this.neighbours[idx] = chunk;
                }
            }
        )
    }


    generateGeometry() {
        const vertices = RHOMBIC_VERTICES.slice();
        const faces = RHOMBIC_FACES_2D.slice();

        // used to indicate which vertices are
        // around the openings, so that we don't
        // move them away from the adjoining chunk
        const holeVertices = new Set();

        // remove the open faces while logging their
        // vertices so that we can leave portals to
        // match up between chunks
        this.openFaces.forEach(
            face => {
                face.forEach(vidx => holeVertices.add(vidx));
                faces[faces.indexOf(face)] = null;
            }
        );

        if (INSET_FACTOR !== 1) {
            for (let i = 0, l = 14; i < l; i++) {
                if (!holeVertices.has(i)) {
                    const n = i * 3;
                    vertices[n] = vertices[n] * INSET_FACTOR;
                    vertices[n + 1] = vertices[n + 1] * INSET_FACTOR;
                    vertices[n + 2] = vertices[n + 2] * INSET_FACTOR;
                }
            }
        }


        // start creating the THREE geometry
        const indexedgeometry = new THREE.BufferGeometry();
        indexedgeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        indexedgeometry.setIndex(faces.filter(Boolean).flat());


        // apply (different) uvs for the faces
        const uvs = [];

        faces.forEach(
            face => {
                const uvNum = 2;//Math.floor(Math.random() * RHOMBIC_UVS_2D.length);

                uvs.push(
                    //...RHOMBIC_UVS_2D[uvNum]
                    0,1, 0,0, 1,0,
                    0,1, 1,0, 1,1
                );
            }
        );

        const geometry = indexedgeometry.toNonIndexed();
        geometry.computeVertexNormals();
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.computeBoundsTree();


        // move chunk into position
        geometry.translate(...this.position.toArray());
        geometry.scale(this.cave.scale, this.cave.scale, this.cave.scale);

        this.geometry = smoothGeometry(geometry);
        this.generateMesh();

        return this.geometry;
    }

    generateMesh() {
        this.mesh = new THREE.Mesh(
            this.geometry,
            blockMaterial
        );

        this.mesh._cavecell = this;
    }


    #openings = [];

    set openings(indexes) {
        this.#openings = [...indexes];
    }

    get openings() {
        return this.#openings.map(idx => this.neighbours[idx]);
    }
    get openFaces() {
        return this.#openings.map(idx => RHOMBIC_FACES_2D[idx]);
    }
    
    getRandomPointOnMesh() {
        let intersection;
        let distance = this.cave.scale;
        do {
            raycaster.set(
                this.worldposition,
                tmpVec3.randomDirection()
            );
            const intersections = raycaster.intersectObject(this.mesh);console.log(intersections);
            if (intersections.length && intersections[0].distance < distance) {
                intersection = intersections[0];
            }
            // gradually widen the search
            distance *= 1.1;
        } while(!intersection);

        return intersection;
    }

    getRandomGridCell() {
        const rdIdx = Math.floor(Math.random() * (this.surfaceGrid.length));
        //console.log(rdIdx);
        return this.surfaceGrid[rdIdx];
    }
}



function generateLattice(size) {
    const chunks = [];

    const idir = new THREE.Vector3(2, 0, 2);
    const jdir = new THREE.Vector3(2, 2, 0);
    const kdir = new THREE.Vector3(-2, 0, 2);

    let centre;

    const halfsize = Math.round((size - 1) / 2);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                const chunk = new Chunk(
                    (new THREE.Vector3())
                    .add(idir.clone().multiplyScalar(i))
                    .add(jdir.clone().multiplyScalar(j))
                    .add(kdir.clone().multiplyScalar(k))
                );

                chunks.push( chunk );

                if (i === halfsize && j === halfsize && k === halfsize) {
                    centre = chunk;
                }
            }
        }
    }

    chunks.forEach(chunk => chunk.findNeighbours(chunks));

    return [ chunks, centre ];
}


function generateTunnel(grid, start) {
    let current = start;

    const visited = [];

    
    function advanceCursor(cursor) {
        cursor.filled = false;
        if (visited.indexOf(cursor) < 0) visited.push(cursor);

        if (cursor === start && tunnelStarts.length) {
            
        }
        
        const valid = cursor.neighbours.filter(
            // check each direct neighbour
            neighbour => neighbour.filled
                && neighbour.neighbours.every(
                    // then each of their neighbours
                    neighbour2 => neighbour2 === cursor || neighbour2.filled
                )
        );
    
        if (valid.length) {
            return valid[Math.floor(Math.random() * valid.length)];
        } else {
            visited.splice(visited.indexOf(cursor), 1);
    
            return visited.length
                ? visited[Math.floor(visited.length * Math.random() * Math.random())]
                : null;
        }
    }


    const tunnelStarts = INITIAL_TUNNEL_DIRS.map(dIdx => start.neighbours[dIdx]);
    tunnelStarts.forEach(chunk => {
        advanceCursor(chunk);
    });

    while (current) {
        current = advanceCursor(current);
    }

    const tunnel = grid.filter(({filled}) => !filled);

    // give em an ID so easier to debug
    tunnel.forEach((chunk, idx) => {
        chunk.idx = idx;

        // check each neighbour, if it's open we
        // need to flag that face for removal
        // N.B. this works because the directions
        //      are in the same order as the faces
        const openDirections = [];
        
        chunk.neighbours.forEach(
            (neighbour, nidx) => {
                if (neighbour && !neighbour.filled) {
                    openDirections.push(nidx);
                } else {
                    chunk.neighbours[nidx] = null;
                }
            }
        );

        // assign this now that it's been calculated
        chunk.openings = openDirections;
    });

    return tunnel;
}


// used to inset vertices for smoothing (prevents
// nastiness when chunks are corner-to-corner)
//const INSET_FACTOR = 0.75;
const INSET_FACTOR = 2 / 3;

function generateGeometry(tunnel) {
    const geometries = [];

    tunnel.forEach(
        chunk => {
            geometries.push(chunk.generateGeometry());
        }
    );

    // return all of them merged together, should be nice
    // and neat with no overlapping anything, no interior
    // walls just a nice clean "cave"
    return BufferGeometryUtils.mergeGeometries(geometries);
}

function smoothGeometry(geometry) {

    // TODO: detect vertices that are common without a
    //      shared edge and separate them slightly?
    //      INSET_FACTOR can do that but ideally can
    //      find a way to just fix the ones that go all
    //      pointy

    const smoothed = LoopSubdivision.modify(
        geometry,
        1,
        {
            split: false,
            preserveEdges: true
        }
    );

    smoothed.computeVertexNormals();
    smoothed.computeBoundsTree();

    return smoothed;
}


const tmpVec3A = new THREE.Vector3(),
    tmpVec3B = new THREE.Vector3(),
    tmpVec3C = new THREE.Vector3();

const tmpTriangle = new THREE.Triangle(),
    tmpPosn = new THREE.Vector3(),
    tmpNormal = new THREE.Vector3();


function generatePFNodes(geometry) {
    const vertexCentres = new Map();

    function addVertexCentre(vertex, centre) {
        //const key = tmpVec3.copy(vertex)/* .multiplyScalar(100) */.round().toArray().join(',');

        let found = false;

        for (let [key] of vertexCentres) {
            if (key.equals(vertex)) {
                vertexCentres.set(key, [ ...vertexCentres.get(key), centre ]);
                found = true;
                break;
            }
        }

        if (!found) {
            vertexCentres.set(
                vertex.clone(),
                [ centre ]
            );
        }
    }

    const nodes = [];

    const vCount = geometry.attributes.position.count;

    for (let i = 0; i < vCount; i += 3) {
        tmpVec3A.fromBufferAttribute(geometry.attributes.position, i);
        tmpVec3B.fromBufferAttribute(geometry.attributes.position, i + 1);
        tmpVec3C.fromBufferAttribute(geometry.attributes.position, i + 2);

        // get centrepoint & normal
        tmpTriangle.set(tmpVec3A, tmpVec3B, tmpVec3C);
        tmpTriangle.getMidpoint(tmpPosn);
        tmpTriangle.getNormal(tmpNormal);
        // we are inside the mesh so negate
        tmpNormal.negate();

        const node = {
            posn: tmpPosn.clone(),
            normal: tmpNormal.clone(),
            edges: []
        };

        nodes.push(node);

        addVertexCentre(tmpVec3A, node);
        addVertexCentre(tmpVec3B, node);
        addVertexCentre(tmpVec3C, node);
    }

    for (let [key, nodes] of vertexCentres) {
        nodes.forEach(
            node => {
                nodes.forEach(n => {
                    if (n != node) {
                        node.edges.push(n);
                    }
                });
            }
        );
    }

    return nodes;
}


