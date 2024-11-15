import * as THREE from 'three';

import { knees } from './geometry.js';


const SQRT3 = Math.sqrt(3);





export const OPEN_FACTOR = 2.5;



function legOpenTrack(idx, boneId, length = 1) {
    const posns = [];
    const times = [];

    for (let i = 0; i <= 10; i++) {
        const t = i / 10;

        const x = OPEN_FACTOR * (1 - Math.cos(t * Math.PI)) / 2
        const y = Math.sin(t * Math.PI);
        
        times.push(t * length);
        posns.push(knees[idx].x * x, -SQRT3, knees[idx].z * x);
        //posns.push(0, -SQRT3 - y, 0);
    }
    
    return new THREE.VectorKeyframeTrack(
        `${boneId}.position`,
        times,
        posns
    );
}

function bodyOpenTrack(meshId, length = 1) {
    const posns = [];
    const times = [];

    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const y = Math.sin(t * Math.PI);

        times.push(t * length);
        posns.push(0, (SQRT3 + y) * 2, 0);
    }

    return new THREE.VectorKeyframeTrack(
        `${meshId}.position`,
        times,
        posns
    );
}




function legTurnTrack(idx, boneId, length = 1) {
    const posns = [];
    const times = [];

    const x = knees[idx].x * OPEN_FACTOR,
        z = knees[idx].z * OPEN_FACTOR;

    for (let i = 0; i < 30; i++) {
        const iAdj = i - (10 * idx);

        const angle = Math.PI * i / 30,
            cos = Math.cos(angle),
            sin = Math.sin(angle);

        let xi = (x * cos) - (z * sin),
            zi = (z * cos) + (x * sin);
        
        posns.push(
            xi, -SQRT3, zi
        );

        times.push(i / 10);
    }
    
    return new THREE.VectorKeyframeTrack(
        `${boneId}.position`,
        times,
        posns
    );
}









export default function createMixer(mesh) {
    const mixer = new THREE.AnimationMixer(mesh);



    const openClip = new THREE.AnimationClip(
        'open',
        1,
        [
            legOpenTrack(0, mesh.skeleton.bones[7].uuid),
            legOpenTrack(1, mesh.skeleton.bones[13].uuid),
            legOpenTrack(2, mesh.skeleton.bones[19].uuid),
            bodyOpenTrack(mesh.skeleton.bones[1].uuid)
        ]
    );



    const stepClip = new THREE.AnimationClip(
        'step',
        3,
        [
            new THREE.VectorKeyframeTrack(
                `${mesh.skeleton.bones[7].uuid}.position`,
                [0,1,1.3,2,3],
                [
                    4,-SQRT3,0.5,
                    4,-SQRT3,-0.5,
                    4,-SQRT3/3,0.5,
                    4,-SQRT3,1.5,
                    4,-SQRT3,0.5,
                ]
            ),
            new THREE.VectorKeyframeTrack(
                `${mesh.skeleton.bones[13].uuid}.position`,
                [0,0.3,1,2,3],
                [
                    0,-SQRT3,-5,
                    0,-SQRT3/3,-4,
                    0,-SQRT3,-3,
                    0,-SQRT3,-4,
                    0,-SQRT3,-5
                ]
            ),
            new THREE.VectorKeyframeTrack(
                `${mesh.skeleton.bones[19].uuid}.position`,
                [0,1,2,2.3,3],
                [
                    -4,-SQRT3,2,
                    -4,-SQRT3,1,
                    -4,-SQRT3,0,
                    -4,-SQRT3/3,1,
                    -4,-SQRT3,2,
                ]
            ),
        ]
    );



    const turnClip = new THREE.AnimationClip(
        'turn',
        3,
        [
            legTurnTrack(0, mesh.skeleton.bones[7].uuid),
            legTurnTrack(1, mesh.skeleton.bones[13].uuid),
            legTurnTrack(2, mesh.skeleton.bones[19].uuid),
        ]
    );



    const openAction = mixer.clipAction(openClip);
    openAction.repetitions = 1;
    openAction.clampWhenFinished = true;


    const stepAction = mixer.clipAction(stepClip);
    stepAction.setDuration(1);


    const turnAction = mixer.clipAction(turnClip);
    turnAction.setDuration(1);

    
    return {
        mixer,
        openAction,
        stepAction,
        turnAction
    };
}