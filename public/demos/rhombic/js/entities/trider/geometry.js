import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import { TRIGONAL_ROTATER, createTrigonal } from "../../geometries/trigonaltrapezahedron.js";





const UVS = [
    0,1, 0,0, 1,0,
    0,1, 1,0, 1,1
];

const ARM_UVS = new Float32Array([
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS
])




const SQRT3 = Math.sqrt(3);


const trigonal = createTrigonal();
trigonal.computeBoundingBox();



const body = trigonal.clone();

body.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS,
    ...UVS,
]), 2));


const tmpVec3 = new THREE.Vector3();

export const knees = [
    [2, 0, 0],
    [0, 2, 0],
    [0, 0, 2]
].map(
    arr => tmpVec3
        .fromArray(arr)
        .applyQuaternion(TRIGONAL_ROTATER)
        .clone()
);


const knee1 = knees[0];


const A = new THREE.Vector3(knee1.x, 0, knee1.z);

const theta = Math.acos(A.dot(knee1) / (A.length() * knee1.length()));




const flipAxis = new THREE.Vector3(0, -1, 0);

const arm1 = trigonal.clone();
arm1.setAttribute('uv', new THREE.BufferAttribute(ARM_UVS, 2));
arm1.applyQuaternion(
    (new THREE.Quaternion()).setFromAxisAngle(
        flipAxis,
        Math.PI
    ).multiply(
        (new THREE.Quaternion()).setFromAxisAngle(
            new THREE.Vector3(-1, 0, 1.73205080757).normalize(),
            Math.PI - (2 * theta)
        )
    )
);

const arm2 = trigonal.clone();
arm2.setAttribute('uv', new THREE.BufferAttribute(ARM_UVS, 2));
const arm2rotAxis = new THREE.Vector3(1, 0, 0).normalize();
arm2.applyQuaternion(
    (new THREE.Quaternion()).setFromAxisAngle(
        flipAxis,
        Math.PI
    ).multiply(
        (new THREE.Quaternion()).setFromAxisAngle(
            arm2rotAxis,
            Math.PI - (2 * theta)
        )
    )
);

const arm3 = trigonal.clone();
arm3.setAttribute('uv', new THREE.BufferAttribute(ARM_UVS, 2));
const arm3rotAxis = new THREE.Vector3(-1, 0, -1.73205080757).normalize();
arm3.applyQuaternion(
    (new THREE.Quaternion()).setFromAxisAngle(
        flipAxis,
        Math.PI
    ).multiply(
        (new THREE.Quaternion()).setFromAxisAngle(
            arm3rotAxis,
            Math.PI - (2 * theta)
        )
    )
);

export const geometry = BufferGeometryUtils.mergeGeometries([body, arm1, arm2, arm3])

geometry.translate(0, SQRT3, 0);