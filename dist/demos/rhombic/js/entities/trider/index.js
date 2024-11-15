import * as THREE from 'three';
import { CCDIKSolver } from 'three/addons/animation/CCDIKSolver.js';

import { geometry, knees } from './geometry.js';
import { BONES_PER_LEG, iks, skeleton } from './skeleton.js';
import createMixer, { OPEN_FACTOR } from './animations.js';
import COLORS from '../color/index.js';



const SQRT3 = Math.sqrt(3);


const GLOW_COLOR =  COLORS[Math.floor(COLORS.length * Math.random())];


const texture = new THREE.TextureLoader().load('./img/trider.png');
const texturebump = new THREE.TextureLoader().load('./img/trider.png');
const textureemissive = new THREE.TextureLoader().load('./img/trider-emissive.png');

texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestMipmapNearestFilter;
texturebump.magFilter = THREE.NearestFilter;
texturebump.minFilter = THREE.NearestMipmapNearestFilter;
textureemissive.magFilter = THREE.NearestFilter;
textureemissive.minFilter = THREE.NearestMipmapNearestFilter;

export const blockMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    bumpScale: 0.1,
    bumpMap: texturebump,
    emissive: GLOW_COLOR,
    emissiveMap: textureemissive,
});



const BASE_STANCE = knees.map(
    ({x, z}) => new THREE.Vector3(
        x * OPEN_FACTOR,
        0,
        z * OPEN_FACTOR
    )
);



const ORIENTATION_VECTORS = [];
const ORIENTATION_ORIGIN_HEIGHT = SQRT3 * 2;

for (let i = 0, l = 12; i < l; i++) {
    ORIENTATION_VECTORS.push(
        /* new THREE.Vector3()
        .setFromSphericalCoords(1, 5 * Math.PI / 8, i * (2 * Math.PI / l)), */
        new THREE.Vector3()
        .setFromSphericalCoords(1, 6 * Math.PI / 8, i * (2 * Math.PI / l)),
        new THREE.Vector3()
        .setFromSphericalCoords(1, 7 * Math.PI / 8, i * (2 * Math.PI / l))
    );
}




const light = new THREE.PointLight( GLOW_COLOR, 1, 20 );
light.position.add({x: 0, y: ORIENTATION_ORIGIN_HEIGHT, z: 0});


/* const spotlight = new THREE.SpotLight(GLOW_COLOR, 1, 150, Math.PI / 6, 0.5, 4);
const spottarget = new THREE.Object3D();

spotlight.position.set(0, SQRT3 * 2, SQRT3);
spottarget.position.set(0, SQRT3 * 2, 1 + SQRT3);
spotlight.target = spottarget; */


// orientation arrows
/* ORIENTATION_VECTORS.forEach(
    dir => {
        const arr = new THREE.ArrowHelper(
            dir,
            new THREE.Vector3(0, SQRT3 * 2, 0),
            3
        );
        trigonalmesh.add(arr);
    }
); */

// foot position dots
const DEBUG_FOOTDOTS = false;
const olddots = [];
const newdots = [];

if (DEBUG_FOOTDOTS) {
    BASE_STANCE.forEach(
        foot => {
            const olddot = new THREE.Mesh(
                new THREE.SphereGeometry(0.1),
                new THREE.MeshLambertMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000
                })
            );
            olddot.position.copy(foot);
            trigonalmesh.add(olddot);
            olddots.push(olddot);

            const newdot = new THREE.Mesh(
                new THREE.SphereGeometry(0.1),
                new THREE.MeshLambertMaterial({
                    color: 0x0000ff,
                    emissive: 0x0000ff
                })
            );
            newdot.position.copy(foot);
            trigonalmesh.add(newdot);
            newdots.push(newdot);

            const basedot = new THREE.Mesh(
                new THREE.SphereGeometry(0.1),
                new THREE.MeshLambertMaterial({
                    color: 0x00ff00,
                    emissive: 0x00ff00
                })
            );
            basedot.position.copy(foot);
            trigonalmesh.add(basedot);
        }
    );
}



const raycaster = new THREE.Raycaster();

const tmpVec3 = new THREE.Vector3(),
    tmpQuat = new THREE.Quaternion(),
    anotherTmpQuat = new THREE.Quaternion();

const forwardQuat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1)
);



export default class Trider {
    up = null
    forwards = null

    #moveSpeed = 7


    #footIKBones = [];
    #footFaceIdxs = [];

    #footOldPosns = [tmpVec3.clone(), tmpVec3.clone(), tmpVec3.clone()];
    #footNewPosns = [tmpVec3.clone(), tmpVec3.clone(), tmpVec3.clone()];

    #stepTs = [0, 0, 0];

    constructor() {
        this.mesh = new THREE.SkinnedMesh(
            geometry,
            blockMaterial
        );
        this.mesh.add(skeleton.bones[0]); // root bone
        this.mesh.bind(skeleton);
        this.mesh.add(light);
        //this.mesh.add(spotlight);
        //this.mesh.add(spottarget);
        this.#footIKBones = [
            this.mesh.skeleton.bones[1 + BONES_PER_LEG],
            this.mesh.skeleton.bones[1 + BONES_PER_LEG + BONES_PER_LEG],
            this.mesh.skeleton.bones[1 + BONES_PER_LEG + BONES_PER_LEG + BONES_PER_LEG],
        ];

        //this.mesh.scale.set(0.5, 0.5, 0.5);

        this.ikSolver = new CCDIKSolver( this.mesh, iks );
    }

    get position() {
        return this.mesh.position;
    }

    get quaternion() {
        return this.mesh.quaternion;
    }

    init(
        position,
        normal
    ) {
        this.up = new THREE.Vector3().copy(normal);
        tmpQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.up);
        this.mesh.applyQuaternion(tmpQuat);


        this.position.copy(position);

        // convert the normal old posns to
        // the trider's position etc.
        this.#footOldPosns = this.#footOldPosns.map(
            foot => this.#localFootToAbsolute(foot)
        );

        // create new posns based on BASE_STANCE
        this.#footNewPosns = BASE_STANCE.map(
            foot => this.#localFootToAbsolute(foot)
        );
    }

    tick(
        dt,
        cavemesh,
        movinginput
    ) {
        const speed = dt * this.#moveSpeed;
        const moveDirection = tmpVec3.set(
            -movinginput.vector.x,
            0,
            movinginput.vector.y
        ).applyQuaternion(this.quaternion).clone();
        const moveForce = Math.min(movinginput.force, 1);
        
        if (moveDirection) {
            const moveAmount = moveDirection.clone().multiplyScalar(speed * moveForce);

            let newPosn = this.position.clone().add(moveAmount);

            this.position.copy(newPosn);
        }

        this.mesh.skeleton.bones[1].position.setX(
            -movinginput.vector.x * moveForce * 2.5
        )
        this.mesh.skeleton.bones[1].position.setZ(
            movinginput.vector.y * moveForce * 2.5
        )
        this.mesh.skeleton.bones[1].rotation.set(
            movinginput.vector.y * moveForce * 0.7,
            0,//movinginput.vector.x / 2,
            movinginput.vector.x * moveForce * 0.7
        )
        
        // place foot bones on their abs positions,
        // checking they've not gone through the
        // floor
        this.#tickFeet(
            speed,
            cavemesh,
            moveDirection,
            moveForce
        );

        // handle "up" based on floor intersections
        const floornormal = new THREE.Vector3().copy(this.up);
        const posn = tmpVec3.copy(this.up).multiplyScalar(ORIENTATION_ORIGIN_HEIGHT).add(this.position).clone();

        ORIENTATION_VECTORS.forEach(
            orientVec => {
                raycaster.set(posn, tmpVec3.copy(orientVec).applyQuaternion(this.quaternion));
                const intersects = raycaster.intersectObject(cavemesh);
                if (intersects[0] && intersects[0].distance < ORIENTATION_ORIGIN_HEIGHT * 2 ) {
                    floornormal.add(intersects[0].normal);
                } else {

                }
            }
        );
        floornormal.normalize();

        tmpQuat.identity().slerp(
            anotherTmpQuat.setFromUnitVectors(this.up, floornormal),
            0.1
        );


        // handle turning
        if (movinginput.force && movinginput.vector.x) {
            const theta = Math.atan(-movinginput.vector.x, movinginput.vector.y);

            tmpQuat.slerp(
                anotherTmpQuat.setFromAxisAngle(floornormal, theta),
                0.05
            );
        }


        this.up.applyQuaternion(tmpQuat);
        this.mesh.applyQuaternion(tmpQuat);

        
        floornormal.negate();

        raycaster.set(posn, tmpVec3.copy(this.up).negate());
        const floorintersect = raycaster.intersectObject(cavemesh);

        if (floorintersect[0]) {
            if (
                floorintersect[0].distance > ORIENTATION_ORIGIN_HEIGHT * 1.0001
                ||  floorintersect[0].distance < ORIENTATION_ORIGIN_HEIGHT * 0.9999
            ) {
                tmpVec3.copy(this.up).multiplyScalar(ORIENTATION_ORIGIN_HEIGHT - floorintersect[0].distance);
                this.mesh.position.add(tmpVec3);
            }
        }

        this.ikSolver?.update();
    }

    
    #tickFeet(
        speed,
        cavemesh,
        moveDirection,
        moveForce
    ) {
        // TODO: this.down ?
        const up = this.up,
            down = this.up.clone().negate();

        // reverse rotation to work out footbone posns
        tmpQuat.copy(this.mesh.quaternion).invert();

        let toStepWeight = 0;
        let toStepFn = null;

        this.#footIKBones.forEach(
            (footbone, idx) => {
                const ideal = BASE_STANCE[idx];

                // default/resting behaviour is to put bone
                // at old position
                const oldPosn = this.#footOldPosns[idx];

                let target = this.#absoluteFootToLocal(oldPosn, tmpQuat);

                // if there is a newPosn we'll need to lerp
                const newPosn = this.#footNewPosns[idx];


                if (DEBUG_FOOTDOTS) {
                    olddots[idx].position.copy(this.#absoluteFootToLocal(oldPosn, tmpQuat));
                    newdots[idx].position.copy(
                        newPosn
                        ? this.#absoluteFootToLocal(newPosn, tmpQuat)
                        : olddots[idx].position
                    );
                }


                if (newPosn) {
                    this.#stepTs[idx] += speed;
    
                    const stepT = Math.min(this.#stepTs[idx], 1);

                    const newTarget = this.#absoluteFootToLocal(newPosn, tmpQuat);

                    target.lerp(newTarget, stepT);

                    // lift foot
                    target.add({
                        x: 0,
                        y: Math.sin(stepT * Math.PI),
                        z: 0
                    });

                    // check foot for collision w/ terrain
                    raycaster.set(this.#localFootToAbsolute(target).add(up), down);

                    const downintersects = raycaster.intersectObject(cavemesh);

                    if (downintersects[0] && downintersects[0].distance < 0.99) {
                        this.#stepTs[idx] = 0;
                        this.#footOldPosns[idx] = downintersects[0].point;
                        this.#footNewPosns[idx] = null;
                    } else if (stepT >= 1) {
                        this.#stepTs[idx] = 0;
                        this.#footOldPosns[idx].copy(this.#footNewPosns[idx]);
                        this.#footNewPosns[idx] = null;
                    }
                } else {
                    const targetdist = target.distanceToSquared(ideal);

                    // check if this foot needs to be moved
                    if (
                        targetdist > 0.5
                        // stagger steps, don't start one while another is running
                        &&!this.#footNewPosns.some(Boolean)
                    ) {
                        // if there are multiple options take the
                        // furthest one
                        if (targetdist > toStepWeight) {
                            const absIdeal = this.#localFootToAbsolute(ideal);

                            if (moveDirection && moveForce) {
                                tmpVec3.copy(moveDirection).normalize().multiplyScalar(
                                    2
                                );

                                absIdeal.add(tmpVec3);
                            }
                            
                            toStepWeight = targetdist;
                            toStepFn = () => {
                                this.#stepTs[idx] = 0;
                                this.#footNewPosns[idx] = absIdeal;
                            }
                        }
                    }
                }
                

                // set bone position to target
                footbone.position.copy(target);
            }
        );

        if (toStepFn) {
            toStepFn();
        }
    }


    #localFootToAbsolute(loc) {
        return tmpVec3.copy(loc)
            .applyQuaternion(this.mesh.quaternion)
            .add(this.position).clone();
    }

    #absoluteFootToLocal(abs, quat) {
        return tmpVec3.copy(abs)
            .sub(this.position)
            .applyQuaternion(quat).clone();
    }
}







function fuzzyequals( a, b ) {
    const epsilon = Number.EPSILON;
    return ( ( Math.abs( a.x - b.x ) < epsilon ) && ( Math.abs( a.y - b.y ) < epsilon ) && ( Math.abs( a.z - b.z ) < epsilon ) );

}