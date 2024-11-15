import * as THREE from 'three';

const A = new THREE.Vector3(1,-1,1),
    B = new THREE.Vector3(0,2,0);

const theta = Math.acos(A.dot(B) / (A.length() * B.length()));

export const TRIGONAL_ROTATER = (
    (new THREE.Quaternion()).setFromAxisAngle(
        new THREE.Vector3(0,1,0).normalize(),
        7 * Math.PI / 4
    )
).multiply(
    (new THREE.Quaternion()).setFromAxisAngle(
        new THREE.Vector3(-1,0,1).normalize(),
        (Math.PI - theta)
    )
);

const tmpVec3 = new THREE.Vector3();
const vertices = [
    [0, 0, 0],
    [2, 0, 0],
    [0, 2, 0],
    [0, 0, 2],

    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [-1, 1, 1],
].map(
    arr => tmpVec3
            .fromArray(arr)
            .applyQuaternion(TRIGONAL_ROTATER)
            .toArray()
);

export const TRIGONAL_VERTICES = new Float32Array(
    vertices.flat()
);

export const TRIGONAL_FACES = [
    1,5,4, 2,4,5,
    6,1,4, 6,4,3,
    7,3,4, 7,4,2,

    5,1,0, 6,0,1,
    2,5,0, 2,0,7,
    6,3,0, 7,0,3,
];

const uvs = [
    0,1, 0,0, 1,0,
    0,1, 1,0, 1,1
]

export const TRIGONAL_UVS = [
    uvs, uvs, uvs, uvs, uvs, uvs
];



export function createTrigonal() {
    const indexedgeometry = new THREE.BufferGeometry();

    const vertices = TRIGONAL_VERTICES;
    const faces = TRIGONAL_FACES;
    const uvs = TRIGONAL_UVS;

    indexedgeometry.setIndex(faces);
    indexedgeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            vertices, 3
        )
    );

    const geometry = indexedgeometry.toNonIndexed();
    geometry.computeVertexNormals();
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeBoundsTree();

    return geometry;
}