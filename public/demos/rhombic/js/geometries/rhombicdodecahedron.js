import * as THREE from 'three';

export const RHOMBIC_VERTICES = [
    1,1,1, 1,1,-1, 1,-1,1, 1,-1,-1,
    -1,1,1, -1,1,-1, -1,-1,1, -1,-1,-1,
    2,0,0, 0,2,0, 0,0,2,
    -2,0,0, 0,-2,0, 0,0,-2
];

export const RHOMBIC_FACES_2D = [
    [0,8,1, 0,1,9],
    [2,8,0, 2,0,10],
    [3,8,2, 3,2,12],
    [1,8,3, 1,3,13],

    [6,11,7, 6,7,12],
    [4,11,6, 4,6,10],
    [5,11,4, 5,4,9],
    [7,11,5, 7,5,13],

    [4,10,0, 4,0,9],
    [5,9,1, 5,1,13],

    [6,12,2, 6,2,10],
    [7,13,3, 7,3,12],
]

export const RHOMBIC_FACES = RHOMBIC_FACES_2D.flat();

export const RHOMBIC_UVS_2D = [
    [0.25,1, 0.25,0.75, 0.5,0.75,
    0.25,1, 0.5,0.75, 0.5,1],

    [0.5,1, 0.5,0.75, 0.75,0.75,
    0.5,1, 0.75,0.75, 0.75,1],

    [0.75,1, 0.75,0.75, 1,0.75,
    0.75,1, 1,0.75, 1,1],

    [0,0.75, 0,0.5, 0.25,0.5,
    0,0.75, 0.25,0.5, 0.25,0.75],


    [0.25,0.75, 0.25,0.5, 0.5,0.5,
    0.25,0.75, 0.5,0.5, 0.5,0.75],

    [0.5,0.75, 0.5,0.5, 0.75,0.5,
    0.5,0.75, 0.75,0.5, 0.75,0.75],

    [0.75,0.75, 0.75,0.5, 1,0.5,
    0.75,0.75, 1,0.5, 1,0.75],

    [0,0.5, 0,0.25, 0.25,0.25,
    0,0.5, 0.25,0.25, 0.25,0.5],


    [0.25,0.5, 0.25,0.25, 0.5,0.25,
    0.25,0.5, 0.5,0.25, 0.5,0.5],

    [0.5,0.5, 0.5,0.25, 0.75,0.25,
    0.5,0.5, 0.75,0.25, 0.75,0.5],


    [0.75,0.5, 0.75,0.25, 1,0.25,
    0.75,0.5, 1,0.25, 1,0.5],

    [0,0.25, 0,0, 0.25,0,
    0,0.25, 0.25,0, 0.25,0.25],
]

export const RHOMBIC_UVS = RHOMBIC_UVS_2D.flat();



export function createRhombic() {
    const indexedgeometry = new THREE.BufferGeometry();

    const vertices = RHOMBIC_VERTICES;
    const faces = RHOMBIC_FACES;
    const uvs = RHOMBIC_UVS;

    indexedgeometry.setIndex(faces);
    indexedgeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

    const geometry = indexedgeometry.toNonIndexed();
    geometry.computeVertexNormals();
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeBoundsTree();

    return geometry;
}