import * as THREE from 'three';

import Tower from "./Tower.js";



const vshader = `
uniform float amplitude;
uniform float t;

attribute float height;
attribute float radius;
attribute float theta;

varying vec3 vColor;
varying float opacity;

void main() {
    vColor = color;

    float angle1 = (theta + radius + (t * 2.0)) * 2.0;
    float angle2 = (theta * 17.0) - (t * 2.0);

    float actualheight = amplitude * (
        height
        + (
            sin(angle1)
            *  cos(angle2)
            * height
        )
    );

    vec3 newPosition = position + (normal * actualheight);

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);

    gl_PointSize = ( 50.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;

    opacity = max(
        min(
            amplitude + 1.0 - (radius / 3.0),
            1.0
        ),
        0.0
    );
}
`

const fshader = `
varying vec3 vColor;
varying float opacity;

void main() {
    gl_FragColor = vec4( vColor, opacity );
}
`

const RINGS = 7;
const SPACING = 0.5;


const raycaster = new THREE.Raycaster();
const tmpQuat = new THREE.Quaternion(),
    tmpVec3 = new THREE.Vector3(),
    tmpNormal = new THREE.Vector3();

const tmpPosn = new THREE.Vector3(),
    tmpColor = new THREE.Color();

const up = new THREE.Vector3(0, 1, 0);



export default class SourceTower extends Tower {
    constructor(cavecell, targetTower, color) {
        super(cavecell);

        this.color = color;

        this.target = targetTower;

        this.#getMesh();
    }

    generatePathToTarget(particlePathManager) {
        this.particlePathManager = particlePathManager;
        this.path = new THREE.CatmullRomCurve3(
            this.getPathToTower(this.target)
        );
        this.path.updateArcLengths();
        this.curveNo = this.particlePathManager.addCurve(this.path);
    }

    emitParticle() {
        this.particlePathManager.addParticle(this.color, this.curveNo);
    }

    #maxPower = 2;

    #emissionrate = 5;
    #emissionT = 0;

    tick(dt, trider) {
        this.uniforms.t.value += dt;

        const distance = this.position.distanceToSquared(trider.position);
        if (distance < 200 && this.uniforms.amplitude.value < 1) {
            this.uniforms.amplitude.value += dt;
            if (this.uniforms.amplitude.value > 1) {
                this.uniforms.amplitude.value = 1;
            }
            this.light.intensity = this.uniforms.amplitude.value;
        }/*  else if (this.uniforms.amplitude.value > 0.25) {
            this.uniforms.amplitude.value -= (dt / 3);
        } */

        if (this.path) {
            if (this.#emissionT <= 0) {
                this.emitParticle();
                this.#emissionT = this.#emissionrate
                        + (this.#emissionrate * (Math.random() - 0.5));
            } else {
                this.#emissionT -= dt * this.uniforms.amplitude.value * this.uniforms.amplitude.value * 100;
            }
        }
    }

    #getGeometry() {
        const cavemesh = this.cavecell.chunk.cave.mesh;

        const points = [],
            normals = [],
            colors = [],
            radii = [],
            heights = [],
            thetas = [];

        tmpQuat.setFromUnitVectors(up, this.normal);
        tmpVec3.copy(this.normal).multiplyScalar(3).add(this.position);
        tmpNormal.copy(this.normal).negate();

        const color = tmpColor.set(this.color).toArray();

        for (let r = 0; r <= RINGS * SPACING; r += SPACING) {
            const perRing = r * 6;
            for (let t = 0; t < perRing; t++) {
                const fraction = t / perRing;
                const theta = fraction * Math.PI * 2;

                tmpPosn.set(
                    Math.sin(theta) * (r * 3),
                    0,
                    Math.cos(theta) * (r * 3)
                )
                .applyQuaternion(tmpQuat)
                .add(tmpVec3);

                raycaster.set(
                    tmpPosn,
                    tmpNormal
                );

                const tintersects = raycaster.intersectObject(cavemesh);
                
                if (tintersects.length && tintersects[0].distance < 10) {
                    points.push(
                        tintersects[0].point.x,
                        tintersects[0].point.y,
                        tintersects[0].point.z
                    );
                    normals.push(
                        tintersects[0].normal.x,
                        tintersects[0].normal.y,
                        tintersects[0].normal.z
                    );
                    colors.push(...color);
                    radii.push(r * 2);
                    heights.push(3 / r);
                    thetas.push(theta);
                }
                
            }
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute(
            'position',
            new THREE.BufferAttribute( new Float32Array(points), 3 )
        );
        geom.setAttribute(
            'normal',
            new THREE.BufferAttribute( new Float32Array(normals), 3 )
        );
        geom.setAttribute(
            'color',
            new THREE.BufferAttribute( new Float32Array(colors), 3 )
        );
        geom.setAttribute(
            'radius',
            new THREE.BufferAttribute( new Float32Array(radii), 1 )
        );
        geom.setAttribute(
            'height',
            new THREE.BufferAttribute( new Float32Array(heights), 1 )
        );
        geom.setAttribute(
            'theta',
            new THREE.BufferAttribute( new Float32Array(thetas), 1 )
        );

        return geom;
    }

    #getMesh() {
        const geom = this.#getGeometry();

        this.uniforms = {
            t: { value: 0 },
            amplitude: { value: 0.1 }
        };
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vshader,
            fragmentShader: fshader,
        
            transparent: true,
            depthTest: true,
            vertexColors: true
        });
        
        this.mesh = new THREE.Points(
            geom,
            //new THREE.PointsMaterial({ color: this.color, size: 0.1 })
            //new THREE.PointsMaterial({ vertexColors: true }),
            material
        );

        this.light = new THREE.PointLight(
            this.color,
            0.1,
            this.cavecell.chunk.cave.scale * 2
        );

        this.light.position.copy(this.normal).multiplyScalar(5).add(this.position);

        this.mesh.add(this.light);
    }
}