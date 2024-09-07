import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

const GPU_SIZE = 32;
const SCROLLIE_COUNT = GPU_SIZE * GPU_SIZE;

export default class Scrollies {
    constructor(renderer) {
        this.geom = new THREE.BufferGeometry();

        this.vertices = [];
        this.colors = [];
        this.posns = [];

        for (let y = 0; y < GPU_SIZE; y++) {
            for (let x = 0; x < GPU_SIZE; x++) {
                this.vertices.push(
                    (0.5 - Math.random()) * 20,
                    0,
                    0
                );
                
                this.colors.push(Math.random(), Math.random(), Math.random());

                this.posns.push(x / GPU_SIZE, y / GPU_SIZE);
            }
        }

        this.geom.setAttribute(
            'position',
            new THREE.BufferAttribute(
                new Float32Array(this.vertices),
                3
            )
        );

        this.geom.setAttribute(
            'color',
            new THREE.BufferAttribute(
                new Float32Array(this.colors),
                3
            )
        );

        this.geom.setAttribute(
            'posn',
            new THREE.BufferAttribute(
                new Float32Array(this.posns),
                2
            )
        );

        const hasInput = {
            value: new THREE.DataTexture(
                new Float32Array(SCROLLIE_COUNT * 4),
                GPU_SIZE,
                GPU_SIZE,
                THREE.RGBAFormat,
                THREE.FloatType
            )
        };

        const positionInput = {
            value: new THREE.DataTexture(
                new Float32Array(SCROLLIE_COUNT * 4),
                GPU_SIZE,
                GPU_SIZE,
                THREE.RGBAFormat,
                THREE.FloatType
            ),
        };

        const velocityInput = {
            value: new THREE.DataTexture(
                new Float32Array(SCROLLIE_COUNT * 4),
                GPU_SIZE,
                GPU_SIZE,
                THREE.RGBAFormat,
                THREE.FloatType
            ),
        };

        this.uniforms = {
            t: { value: 0, type: 'f' },
            dt: { value: 0, type: 'f' },
            s: { value: 0, type: 'f' },
            n: { value: 0, type: 'i' },
            hasInput,
            velocityInput,
            positionInput
        };

        this.gpuUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
        };

        this.center = { x: 0, y: 0 };

        this.initMesh();
        this.initComputeRenderer(renderer);
    }

    initMesh() {
        this.mesh = new THREE.Points(
            this.geom,
            new THREE.ShaderMaterial({
                uniforms: {
                    ...this.uniforms,
                    ...this.gpuUniforms
                },
                vertexShader: `
                uniform sampler2D texturePosition;
                uniform sampler2D textureVelocity;
                
                varying vec3 vColor;

                attribute vec2 posn;
                attribute vec3 color;
                
                void main() {
                    vec3 pos = texture2D( texturePosition, posn ).xyz;
                
                    vec4 mvPosition = modelViewMatrix * vec4(pos + position, 1.0);
                
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = 25.0;
                
                    vColor = color;
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
            })
        );
    }
    
    initComputeRenderer(renderer) {
        this.computer = new GPUComputationRenderer(
            GPU_SIZE,
            GPU_SIZE,
            renderer
        );

        const posnTexture = this.computer.createTexture();
        const veloTexture = this.computer.createTexture();

        // fill textures
        const posnArr = posnTexture.image.data;
        const veloArr = veloTexture.image.data;
        
        for (let i = 0, l = posnArr.length; i < l; i += 4) {
            posnArr[ i + 0 ] = 0;
            posnArr[ i + 1 ] = -1000000;
            posnArr[ i + 2 ] = 0;
            posnArr[ i + 3 ] = 1;

            veloArr[ i + 0 ] = 0.5 - Math.random();
            veloArr[ i + 1 ] = Math.random();
            veloArr[ i + 2 ] = 0;
            veloArr[ i + 3 ] = 1;
        }


        this.posnVar = this.computer.addVariable(
            'texturePosition',
            `
            uniform float t;
            uniform float dt;
            uniform float s;
            uniform float n;

            uniform sampler2D hasInput;
            uniform sampler2D positionInput;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
    
                // check previous
                vec3 tmpPosn = texture2D( texturePosition, uv ).xyz;
                // check input buffer
                vec3 inputPosn = texture2D( positionInput, uv ).xyz;
                float doInput = texture2D( hasInput, uv ).x;
                // pick buffer vs previous
                vec3 position = doInput > 0.0 ? inputPosn : tmpPosn;

                vec3 velocity = texture2D( textureVelocity, uv ).xyz;
    
                gl_FragColor = vec4( position + velocity * dt * 15., 1.0 );
            }
            `,
            posnTexture
        );

        this.veloVar = this.computer.addVariable(
            'textureVelocity',
            `
            uniform float t;
            uniform float dt;
            uniform float s;

            uniform sampler2D hasInput;
            uniform sampler2D velocityInput;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;

                // check previous
                vec3 tmpVelo = texture2D( textureVelocity, uv ).xyz;
                // check input buffer
                vec3 inputVelo = texture2D( velocityInput, uv ).xyz;
                float doInput = texture2D( hasInput, uv ).y;
                // pick buffer vs previous
                vec3 velocity = doInput > 0.0 ? inputVelo : tmpVelo;

                gl_FragColor = vec4( velocity, 1.0 );
            }
            `,
            veloTexture
        );

        this.computer.setVariableDependencies( this.posnVar, [ this.posnVar, this.veloVar ]);
        this.computer.setVariableDependencies( this.veloVar, [ this.posnVar, this.veloVar ]);

        this.posnVar.material.uniforms = this.uniforms;
        this.veloVar.material.uniforms = this.uniforms;

        this.posnVar.wrapS = THREE.RepeatWrapping;
        this.posnVar.wrapT = THREE.RepeatWrapping;
        this.veloVar.wrapS = THREE.RepeatWrapping;
        this.veloVar.wrapT = THREE.RepeatWrapping;

        const error = this.computer.init();
        if (error !== null) console.error(error);
    }

    tick(dt, s) {
        if (isNaN(dt) || !this.computer) return;

        this.uniforms.t.value += dt;
        this.uniforms.dt.value = dt;

        this.uniforms.s.value = s;

        this.computer.compute();

        this.gpuUniforms.texturePosition.value = this.computer.getCurrentRenderTarget(
            this.posnVar
        ).texture;
        this.gpuUniforms.textureVelocity.value = this.computer.getCurrentRenderTarget(
            this.veloVar
        ).texture;

        this.uniforms.hasInput.value.image.data.fill(0);
        this.uniforms.hasInput.value.needsUpdate = true;

        if (s > 0) {
            this.add(0.5 - Math.random(), 0);
        }
        if (s > 100) {
            this.add(2 * (0.5 - Math.random()), 0);
        }
    }

    next = 0;

    add(x, y) {
        this.uniforms.hasInput.value.image.data[this.next * 4 + 0] = 1;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 1] = 0;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 2] = 1;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 3] = 1;
        this.uniforms.hasInput.value.needsUpdate = true;
        
        const posnArr = this.uniforms.positionInput.value.image.data;

        posnArr[this.next * 4 + 0] = this.center.x + x;
        posnArr[this.next * 4 + 1] = this.center.y + y;
        posnArr[this.next * 4 + 2] = 0;
        posnArr[this.next * 4 + 3] = 1;
        this.uniforms.positionInput.value.needsUpdate = true;
        
        /* const veloArr = this.uniforms.velocityInput.value.image.data;

        veloArr[this.next * 4 + 0] = velocity.x;
        veloArr[this.next * 4 + 1] = velocity.y;
        veloArr[this.next * 4 + 2] = velocity.z;
        veloArr[this.next * 4 + 3] = 1;
        this.uniforms.velocityInput.value.needsUpdate = true; */

        this.next = (this.next + 1) % SCROLLIE_COUNT;
    }

    setCentreY(y) {
        this.center.y = y;
    }
}