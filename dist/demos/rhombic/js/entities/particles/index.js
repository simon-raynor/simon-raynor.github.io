import * as THREE from 'three';


const MAX_PARTICLES = 10000;

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = TEXTURE_WIDTH;
const TEXTURE_CHANNELS = 4;


const tmpVec3 = new THREE.Vector3();
const tmpColor = new THREE.Color();


export default class ParticlePath {
    constructor() {
        this.dataArray = new Float32Array(TEXTURE_WIDTH * TEXTURE_HEIGHT * TEXTURE_CHANNELS);
        this.texture = new THREE.DataTexture(this.dataArray, TEXTURE_WIDTH, TEXTURE_HEIGHT, THREE.RGBAFormat, THREE.FloatType);

        this.curveCount = 0;
        this.curveLengths = [];

        this.particleCount = 0;

        this.posns = new Float32Array( MAX_PARTICLES * 3 );
        this.colors = new Float32Array( MAX_PARTICLES * 3 );
        this.speeds = new Float32Array( MAX_PARTICLES );
        this.offsets = new Float32Array( MAX_PARTICLES );
        this.curveNos = new Float32Array( MAX_PARTICLES );

        this.createGeometry();
        this.createMaterial();
        this.createMesh();
    }

    addCurve(curve) {
        if (this.curveCount === TEXTURE_HEIGHT) {
            throw new Error('max curve count reached');
        }

        this.curveLengths.push(curve.getLength());

        curve.getSpacedPoints(TEXTURE_WIDTH).forEach(
            (point, idx) => {
                this.setTextureValue(
                    idx,
                    point.x,
                    point.y,
                    point.z,
                    this.curveCount
                );
            }
        );

        this.texture.needsUpdate = true;
        this.curveCount++;

        return this.curveCount - 1; // return the curve index
    }

    setTextureValue(index, x, y, z, rowNum) {
        const indexOffset = index * TEXTURE_CHANNELS;
        const rowOffset = TEXTURE_CHANNELS * TEXTURE_WIDTH * rowNum;
        this.dataArray[indexOffset + rowOffset] = x;
        this.dataArray[indexOffset + rowOffset + 1] = y;
        this.dataArray[indexOffset + rowOffset + 2] = z;
        this.dataArray[indexOffset + rowOffset + 3] = 1;
    }


    addParticle(color, curve) {
        if (this.particleCount > MAX_PARTICLES) {
            this.particleCount = 0;
        }

        const speed = 10 / this.curveLengths[curve];
        const offset = -this.uniforms.t.value * speed;

        tmpVec3.randomDirection().multiplyScalar(2 * Math.random());
        tmpColor.set(color);

        const idx = this.particleCount;
        const vIdx = idx * 3;

        this.posns[vIdx] = tmpVec3.x;
        this.posns[vIdx + 1] = tmpVec3.y;
        this.posns[vIdx + 2] = tmpVec3.z;

        this.colors[vIdx] = tmpColor.r;
        this.colors[vIdx + 1] = tmpColor.g;
        this.colors[vIdx + 2] = tmpColor.b;

        this.speeds[idx] = speed;
        this.offsets[idx] = offset;
        this.curveNos[idx] = (curve + 0.5) / TEXTURE_HEIGHT;

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.speed.needsUpdate = true;
        this.geometry.attributes.offset.needsUpdate = true;
        this.geometry.attributes.curveNo.needsUpdate = true;

        this.particleCount++;
    }


    createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute( this.posns, 3 )
        );
        this.geometry.setAttribute(
            'color',
            new THREE.BufferAttribute( this.colors, 3 )
        );
        this.geometry.setAttribute(
            'speed',
            new THREE.BufferAttribute( this.speeds, 1 )
        );
        this.geometry.setAttribute(
            'offset',
            new THREE.BufferAttribute( this.offsets, 1 )
        );
        this.geometry.setAttribute(
            'curveNo',
            new THREE.BufferAttribute( this.curveNos, 1 )
        );
    }

    createMaterial() {
        this.uniforms = {
            t: { value: 0, type: 'f' },
            curvetexture: { value: this.texture },
        };
        
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
            uniform sampler2D curvetexture;
            uniform float t;
        
            attribute float offset;
            attribute float speed;
            attribute float curveNo;
        
            varying vec3 vColor;
        
            void main() {
                vColor = color;
        
                float my_t = (t * speed) + offset;//mod((t * speed) + offset, 1.0);
        
                vec3 curve_posn = texture2D(curvetexture, vec2(my_t, curveNo)).xyz;
        
                vec4 mvPosition = modelViewMatrix * vec4(position + curve_posn, 1.0);
        
                gl_PointSize = ( 50.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
            `,
            fragmentShader: `
            varying vec3 vColor;
        
            void main() {
                gl_FragColor = vec4( vColor, 1.0 );
            }
            `,
        
            transparent: true,
            depthTest: true,
            vertexColors: true
        });
    }

    createMesh() {
        this.mesh = new THREE.Points(
            this.geometry,
            this.material
        );
        this.mesh.frustumCulled = false;
    }

    tick(dt) {
        this.uniforms.t.value += dt;
    }
}