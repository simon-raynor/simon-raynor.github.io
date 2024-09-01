import * as THREE from 'three';

const tmpVec3A = new THREE.Vector3();
const tmpVec3B = new THREE.Vector3();
const tmpQuatA = new THREE.Quaternion();
const tmpQuatB = new THREE.Quaternion();

const raycaster = new THREE.Raycaster();

const STD_UP = new THREE.Vector3(0, 1, 0);
const STD_FWD = new THREE.Vector3(0, 0, 1);

export default class Creature {
    get position() {
        return this.mesh.position;
    }
    get quaternion() {
        return this.mesh.quaternion;
    }

    normal = null;
    speed = 1;
    
    constructor() {
        this.normal = new THREE.Vector3();
    }
    
    init(cave, position, normal) {
        if (!this.mesh) {
            this.#initMesh();
        }
        this.cave = cave;

        this.position.copy(position);
        this.normal.copy(normal);

        tmpQuatA.setFromUnitVectors(STD_UP, this.normal);
        this.mesh.applyQuaternion(tmpQuatA);
    }

    #initMesh() {
        const geom = new THREE.BoxGeometry(3, 3, 3);
        geom.translate(0, 1.5, 0);

        this.mesh = new THREE.Mesh(
            geom,
            new THREE.MeshPhongMaterial({
                color: 0x88ff00
            })
        );

        this.mesh.up = this.normal;


        const arr = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 1.5, 0),
            5
        );
        this.mesh.add(arr);

        const arr2 = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 1.5, 0),
            4,
            0x0000ff
        );
        this.mesh.add(arr2);
    }

    tick(dt) {
        this.move(dt);
    }

    move(dt) {
        if (!this.path) {return;
            //this.pathfind();
        }
        if (!this.moveTarget) {
            this.moveTarget = this.path.shift();
        }
        if (this.moveTarget) {            
            // get required movement vector, rotate into
            // local space and remove any up/down
            tmpVec3A
                .copy(this.moveTarget.position)
                .sub(this.position)
                .applyQuaternion(tmpQuatA.copy(this.quaternion).invert())
                .setY(0);


            if (tmpVec3A.lengthSq() < 1) {
                this.moveTarget = null;
                return;
            }

            // convert mvmt vector back to world space
            tmpVec3A.applyQuaternion(this.quaternion).normalize();


            // reset tmp. quat and use to work out any rotation needed
            tmpQuatA.identity();

            // rotate forwards towards target vec
            tmpQuatA.slerp(
                tmpQuatB.setFromUnitVectors(
                    tmpVec3B.copy(STD_FWD).applyQuaternion(this.quaternion),
                    tmpVec3A
                ),
                0.05
            );

            // apply speed to normalised movement vec,
            // then apply that to position (actually move)
            const moveAmount = dt * this.speed;
            tmpVec3A.multiplyScalar(moveAmount);
            
            this.position.add(tmpVec3A);


            // get floor normal and distance
            tmpVec3A.copy(this.position).add(this.normal);
            tmpVec3B.copy(this.normal).negate();

            raycaster.set(
                tmpVec3A,
                tmpVec3B
            );

            const floorintersect = raycaster.intersectObject(this.cave.mesh);

            if (floorintersect[0]) {
                // rotate towards floor normal
                tmpQuatA.slerp(
                    tmpQuatB.setFromUnitVectors(
                        this.normal,
                        floorintersect[0].normal
                    ),
                    0.1
                );

                // keep at same height above floor
                if (
                    floorintersect[0].distance > 1.0001
                    ||  floorintersect[0].distance < 0.9999
                ) {
                    tmpVec3A.copy(this.normal).multiplyScalar(1 - floorintersect[0].distance);
                    this.position.add(tmpVec3A);
                }
            } else {
                throw new Error('no floor :/');
            }


            // apply rotations
            this.normal.applyQuaternion(tmpQuatA);
            this.mesh.applyQuaternion(tmpQuatA);
        }
    }

    pathfind() {
        this.path = this.cave.pathfinder.pathfind(
            this.position,
            this.target.position
        );
    }
}