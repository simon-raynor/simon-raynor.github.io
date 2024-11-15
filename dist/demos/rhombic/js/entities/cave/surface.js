import * as THREE from 'three';


const tmpVec3 = new THREE.Vector3(),
    tmpVec3A = new THREE.Vector3(),
    tmpVec3B = new THREE.Vector3(),
    tmpVec3C = new THREE.Vector3();

const tmpTriangle = new THREE.Triangle(),
    tmpPosn = new THREE.Vector3(),
    tmpNormal = new THREE.Vector3();


export default function generateSurfaceGrid(cave) {
    const shareMap = new Map();
    const cells = [];

    cave.chunks.forEach(
        chunk => {
            const vCount = chunk.mesh.geometry.attributes.position.count;

            for (let i = 0; i < vCount; i += 3) {
                const cell = new SurfaceCell(chunk, shareMap, i / 3);
                cells.push(cell);
                chunk.surfaceGrid.push(cell);
            }
        }
    )

    

    for (let [key, shared] of shareMap) {
        shared.forEach(
            s => {
                s.setNeighbours(shared);
            }
        );
    }

    return cells;
}


class SurfaceCell {
    centre = new THREE.Vector3();
    normal = new THREE.Vector3();

    neighbours = [];
    directNeighbours = [];

    constructor(chunk, shareMap, idx) {
        this.chunk = chunk;
        this.idx = idx;

        // get centrepoint & normal
        tmpVec3A.copy(this.a);
        tmpVec3B.copy(this.b);
        tmpVec3C.copy(this.c);

        tmpTriangle.set(tmpVec3A, tmpVec3B, tmpVec3C);
        tmpTriangle.getMidpoint(this.centre);
        tmpTriangle.getNormal(this.normal);
        // we are inside the mesh so negate the normal
        this.normal.negate();

        // identify common vertices
        this.#addToShareCheckerMap(shareMap, tmpVec3A);
        this.#addToShareCheckerMap(shareMap, tmpVec3B);
        this.#addToShareCheckerMap(shareMap, tmpVec3C);
    }

    setNeighbours(neighbours) {
        neighbours.forEach(
            otherCell => {
                if (otherCell != this) {
                    if (this.neighbours.includes(otherCell)) {
                        this.directNeighbours.push(otherCell);
                    } else {
                        this.neighbours.push(otherCell);
                    }
                }
            }
        );
    }

    get a() {
        return tmpVec3.fromBufferAttribute(
            this.chunk.geometry.attributes.position,
            this.idx * 3
        );
    }

    get b() {
        return tmpVec3.fromBufferAttribute(
            this.chunk.geometry.attributes.position,
            (this.idx * 3) + 1
        );
    }

    get c() {
        return tmpVec3.fromBufferAttribute(
            this.chunk.geometry.attributes.position,
            (this.idx * 3) + 2
        );
    }

    #addToShareCheckerMap(map, vertex) {
        let found = false;

        for (let [key] of map) {
            if (key.equals(vertex)) {
                map.set(key, [ ...map.get(key), this ]);
                found = true;
                break;
            }
        }

        if (!found) {
            map.set(
                vertex.clone(),
                [ this ]
            );
        }
    }
}
