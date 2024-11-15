import * as THREE from 'three';

import { geometry, knees } from './geometry.js';


const SQRT3 = Math.sqrt(3);



export const BONES_PER_LEG = 6;

const KNEE_LENGTH = 1.25;

const bones = [
    // root
    new THREE.Bone(),
    // spine/neck
    new THREE.Bone(),
];

bones[0].position.set(0, 0, 0);

bones[1].position.set(0, SQRT3 * 3, 0);
bones[0].add(bones[1]);

export const iks = [];

let idx = 2;

knees.forEach(
    kneeposn => {
        const hip1 = new THREE.Bone();
        const hip2 = new THREE.Bone();
        const hip3 = new THREE.Bone();
        const knee = new THREE.Bone();
        const foot = new THREE.Bone();
        const footprint = new THREE.Bone();

        hip1.position.set(kneeposn.x, kneeposn.y + SQRT3, kneeposn.z);
        hip2.position.set(0, 0, 0);
        hip3.position.set(kneeposn.x*KNEE_LENGTH/2, KNEE_LENGTH, kneeposn.z*KNEE_LENGTH/2);
        knee.position.set(-kneeposn.x*KNEE_LENGTH/2, -KNEE_LENGTH, -kneeposn.z*KNEE_LENGTH/2);
        foot.position.set(-kneeposn.x, -kneeposn.y - SQRT3, -kneeposn.z);
        footprint.position.set(0, -SQRT3, 0);

        bones[0].add(hip1, footprint);
        hip1.add(hip2);
        hip2.add(hip3);
        hip3.add(knee);
        knee.add(foot);

        bones.push(
            hip1,
            hip2,
            hip3,
            knee,
            foot,
            footprint
        );

        const kneevector = new THREE.Vector3(kneeposn.z,0,-kneeposn.x);
        kneevector.normalize();

        iks.push(
            {
                target: idx + 5,
                effector: idx + 4,
                links: [
                    {
                        // knee
                        index: idx + 3,
                        limitation: kneevector.clone().negate(),
                        rotationMin: new THREE.Vector3(-Math.PI / 3,-Math.PI / 3,-Math.PI / 3),
                        rotationMax: new THREE.Vector3(Math.PI / 3,Math.PI / 3,Math.PI / 3)
                    },
                    {
                        // hip 3
                        index: idx + 2,
                        rotationMin: new THREE.Vector3(-Math.PI / 6, 0, -Math.PI / 6),
                        rotationMax: new THREE.Vector3(Math.PI / 6, 0, Math.PI / 6)
                    },
                    {
                        // hip 2
                        index: idx + 1,
                        limitation: kneevector.clone().negate(),
                        rotationMin: new THREE.Vector3(-Math.PI / 6, 0, -Math.PI / 6),
                        rotationMax: new THREE.Vector3(Math.PI / 3, 0, Math.PI / 3)
                    },
                    {
                        // hip 1
                        index: idx,
                        limitation: new THREE.Vector3(0, -1, 0),
                        rotationMin: new THREE.Vector3(0, -Math.PI / 8, 0),
                        rotationMax: new THREE.Vector3(0, Math.PI / 8, 0)
                    }
                ],
                iteration: 2,
                /* maxAngle: Math.PI / 8,
                minAngle: 0 */
            }
        );

        idx += BONES_PER_LEG;
    }
);


export const skeleton = new THREE.Skeleton(bones);






const position = geometry.attributes.position;
const vertex = new THREE.Vector3();

const skinIndices = [];
const skinWeights = [];


const POSNS_PER_TRIGON = 36;

for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);

    const leg = Math.floor(i / POSNS_PER_TRIGON);
    const idx = (leg * BONES_PER_LEG) - 1;

    if (leg) {
        skinIndices.push(idx, idx + 1, 0, 0);
    } else {
        skinIndices.push(0, 1, 0, 0);
    }
    skinWeights.push(0.5, 0.5, 0, 0);
}
geometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );