import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CAVESCALE } from '../cave/index.js';


const tmpVec2 = new THREE.Vector2();
const tmpVec3 = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const raycaster = new THREE.Raycaster();

const STD_FWD = new THREE.Vector3(0, 0, 1);

export class Camera {
    constructor() {
        this.wrapper = new THREE.Object3D();
        
        this.instance = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.5,
            500
        );
        this.wrapper.add(this.instance);

        this.light = new THREE.SpotLight(
            0x888888,
            0.5,
            CAVESCALE * 6,
            Math.PI / 4,
            0.75,
            2
        );
        this.light.position.set(0, 0, 1);
        this.wrapper.add(this.light);
        this.light.target = this.instance;

    }

    init(renderer, scene, cave) {
        this.renderer = renderer;


        this.cave = cave;

        // should the render effects really be here? where
        // else could/should they live?
        this.composer = new EffectComposer( renderer );

        const PIXEL_SIZE = 2;
        const pixelPass = new RenderPixelatedPass(PIXEL_SIZE, scene, this.instance);
        pixelPass.normalEdgeStrength = 0.05;
        pixelPass.depthEdgeStrength = 0.1;

        this.composer.addPass(
            pixelPass
        );

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2( window.innerWidth, window.innerHeight ),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = 0.25;
        bloomPass.strength = 0.33;
        bloomPass.radius = 0;
        
        this.composer.addPass(bloomPass);

        this.composer.addPass(
            new OutputPass()
        );

        this.#addEventListeners();


        // TODO ditch this once I'm done debugging
        this.scene = scene;
    }

    destroy() {
        this.#removeEventListeners();
    }


    #t = -1;
    #position = new THREE.Vector3();
    #nextposition = new THREE.Vector3();
    #quaternion = new THREE.Quaternion();
    #nextquaternion = new THREE.Quaternion();

    tick(dt) {
        if (this.#t >= 0) {
            this.#t += dt;

            if (this.#t > 1) {
                this.#t = 1;
            }

            this.wrapper.position.lerpVectors(
                this.#position,
                this.#nextposition,
                this.#t
            );

            this.wrapper.quaternion.slerpQuaternions(
                this.#quaternion,
                this.#nextquaternion,
                this.#t
            );

            if (this.#t === 1) {
                this.#position.copy(this.#nextposition);
                this.#quaternion.copy(this.#nextquaternion);
                this.#t = -1;
            }

        }

        this.render();
    }


    render() {
        this.composer.render();
    }



    lookAt(point, normal) {
        this.#position.copy(this.wrapper.position);
        this.#quaternion.copy(this.wrapper.quaternion);

        this.#nextposition.copy(normal)
            .multiplyScalar(CAVESCALE * 1.75)
            .add(point);
        this.#nextquaternion.setFromUnitVectors(
            STD_FWD,
            normal
        );
        
        this.#t = 0;
    }



    #addEventListeners() {
        this.#addHandler(
            'resize',
            () => {
                this.instance.aspect = window.innerWidth / window.innerHeight;
                this.instance.updateProjectionMatrix();
                this.renderer.setSize( window.innerWidth, window.innerHeight );
            }
        );

        this.#addHandler(
            'click',
            evt => this.#handleClick(evt)
        );

        this.#addHandler(
            'wheel',
            evt => this.#handleWheel(evt)
        );

        this.#addHandler(
            'pointerdown',
            evt => this.#handlePointerDown(evt)
        );

        this.#addHandler(
            'pointerup',
            evt => this.#handlePointerUp(evt)
        );

        this.#addHandler(
            'pointerout',
            evt => this.#handlePointerOut(evt)
        );

        this.#addHandler(
            'pointermove',
            evt => this.#handlePointerMove(evt)
        );
    }

    #handlers = {};

    #addHandler(evtname, fn) {
        if (this.#handlers[evtname]) {
            // TODO reuse the DOM event somehow
            this.#handlers[evtname].push(
                this.renderer.domElement.addEventListener(evtname, fn));
        } else {
            this.#handlers[evtname] = [this.renderer.domElement.addEventListener(evtname, fn)];
        };
    }

    #removeEventListeners() {
        for (let [evtname, handlers] of Object.entries(this.#handlers)) {
            handlers.forEach(handler => this.renderer.domElement.removeEventListener(evtname, handler));
        }
    }


    #handleClick(evt) {
        if (evt.button === 0) {
            if (evt.detail == 1) {
                // single click
                raycaster.setFromCamera(
                    tmpVec2.set(
                        ...normaliseEventScreenCoords(evt)
                    ),
                    this.instance
                );
                
                // TODO: check for clicking on actual "things" e.g. triders
                const intersect = raycaster.intersectObject(this.cave.mesh);

                //console.log(intersect)

                /* this.scene.add(
                    new THREE.ArrowHelper(
                        intersect[0].normal,
                        intersect[0].point,
                        CAVESCALE,
                        0xdddd88
                    )
                ); */

            } else if (evt.detail == 2) {
                // double click
                raycaster.setFromCamera(
                    tmpVec2.set(
                        ...normaliseEventScreenCoords(evt)
                    ),
                    this.instance
                );

                // TODO: check for clicking on actual "things" e.g. triders
                const intersect = raycaster.intersectObject(this.cave.mesh);

                const { point, normal } = intersect[0];

                this.lookAt(point, normal);
            }
        }
    }

    #handleWheel(evt) {
        const dy = evt.deltaY;

        tmpVec3.copy(STD_FWD)
            .applyQuaternion(this.wrapper.quaternion)
            .multiplyScalar(dy / 100);

        this.wrapper.position.add(tmpVec3);
    }


    /*
        WIP
        touch controls
    */

    #pointer1 = null;
    #pointer2 = null;
    #previousClick = Date.now();

    #addPointer(evt) {
        if (!this.#pointer1) {
            const [x, y] = normaliseEventScreenCoords(evt);
            this.#pointer1 = {
                id: evt.pointerId,
                x,
                y,
                t: Date.now()
            };
        } else if (!this.#pointer2) {
            const [x, y] = normaliseEventScreenCoords(evt);
            this.#pointer2 = {
                id: evt.pointerId,
                x,
                y,
                t: Date.now()
            };
        }
    }

    #removePointer(evt) {
        if (this.#pointer1?.id === evt.pointerId) {
            if (this.#pointer2) {
                this.#pointer1 = this.#pointer2;
                this.#pointer2 = null;
            } else {
                this.#pointer1 = null;
                
            }
        } else if (this.#pointer2?.id === evt.pointerId) {
            this.#pointer2 = null;
        }
    }

    #pointerFromEvt(evt) {
        return this.#pointer1?.id === evt.pointerId
            ? this.#pointer1
            : this.#pointer2?.id === evt.pointerId
                ? this.#pointer2
                : null;
    }

    #handlePointerDown(evt) {
        this.#addPointer(evt);
    }

    #handlePointerUp(evt) {
        this.#removePointer(evt);
    }

    #handlePointerOut(evt) {
        this.#removePointer(evt);
    }

    #handlePointerMove(evt) {
        evt.preventDefault();
        if (this.#pointer2) {
            // multitouch
        } else if (
            this.#pointer1
            && this.#pointerFromEvt(evt) === this.#pointer1
        ) {
            const {x, y} = this.#pointer1;
            const [evtX, evtY] = normaliseEventScreenCoords(evt);

            const dx = evtX - x, dy = evtY - y;

            // swap x&y as this is the rotation axis
            tmpVec3.set(
                -dy,
                dx,
                0
            ).applyQuaternion(this.wrapper.quaternion);

            const magnitude = tmpVec3.length();

            tmpQuat.setFromAxisAngle(
                tmpVec3.normalize(),
                magnitude
            );

            this.wrapper.applyQuaternion(tmpQuat);

            this.#pointer1.x = evtX;
            this.#pointer1.y = evtY;

            this.#quaternion.copy(this.wrapper.quaternion);
        }
    }
}


function normaliseEventScreenCoords(evt) {
    return [
        ((evt.clientX / window.innerWidth) * 2) - 1, 
        -(((evt.clientY / window.innerHeight) * 2) - 1)
    ];
}