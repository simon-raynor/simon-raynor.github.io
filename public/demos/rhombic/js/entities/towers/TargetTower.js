import * as THREE from 'three';
import Tower from "./Tower.js";

const tmpQuat = new THREE.Quaternion();
const tmpVec3A = new THREE.Vector3();
const tmpVec3B = new THREE.Vector3();
const stdUp = new THREE.Vector3(0, 1, 0);

const MINLOOPS = 16;

export default class TargetTower extends Tower {
    constructor(cavecell) {
        super(cavecell);

        // get world orientation quat
        this.quat = new THREE.Quaternion().setFromUnitVectors(
            stdUp,
            this.normal
        );

        this.#getMesh();
    }

    tick(dt, trider) {
        super.tick(dt);

        // TODO prevent collision w/ trider (or that may be trider's job)
    }

    pointsInbound(entrance) {
        const spiral = [];

        // underground point to "store" particles invisibly
        //const finalPoint = this.normal.clone().multiplyScalar(-1).add(this.position);
        const finalPoint = this.position;

        spiral.unshift(finalPoint);

        // random spiral start angle offset
        const offset = Math.PI * 2 * Math.random();
        
        // spiral step function for convenience
        const step = (i, theta) => {
            const r = 1 + Math.pow(i / 6, 2);

            const x = Math.sin(theta) * r;
            const y = i - 1/i;
            const z = Math.cos(theta) * r;

            const pt = new THREE.Vector3(x, y, z)
                .applyQuaternion(this.quat)
                //.add(tmpVec3A.random().multiplyScalar(i / 5))
                .add(this.position);

            spiral.unshift(pt);
        }

        let i = 1
        let theta = offset;//Math.PI / 4;

        for (; i <= MINLOOPS; i++) {
            step(i, theta);
            theta += Math.PI / 4;
        }

        tmpVec3A.copy(spiral[0]).sub(spiral[1]);
        tmpVec3B.copy(spiral[0]).sub(entrance);

        // try to get a nice smooth entry to the spiral,
        // we want as close to 180deg as possible (straight
        // lines are the smoothest you can get)
        let angleTo = tmpVec3A.angleTo(tmpVec3B);

        while (
            angleTo < 4 * Math.PI / 5
            && angleTo > -4 * Math.PI / 5
        ) {
            step(i, theta);
            i += 0.25
            theta += Math.PI / 16;
            tmpVec3A.copy(spiral[0]).sub(spiral[1]);
            tmpVec3B.copy(spiral[0]).sub(entrance);
            angleTo = tmpVec3A.angleTo(tmpVec3B);
        }

        return spiral;
    }


    #getMesh() {
        const points = [
            { x: 0, y: 0.001 },
            { x: 3, y: 0.002 },
            { x: 3.5, y: 1.5 },
            { x: 4.5, y: 3 },
            { x: 6, y: 4.5 }
        ];
        const geom = new THREE.LatheGeometry(
            points,
            12
        );

        const material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
            side: THREE.DoubleSide
        })

        this.mesh = new THREE.Mesh(
            geom,
            material,
        );

        this.mesh.position.copy(this.position);
        this.mesh.applyQuaternion(this.quat);
    }
}