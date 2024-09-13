import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import glyphs, { GLYPH_COUNT } from './shapes.js';

const GPU_SIZE = 32;
const SCROLLIE_COUNT = GPU_SIZE * GPU_SIZE;

const VERTICES = [
    -1, -1, 0,  0, -1, 0,  0, 0, 0,
    -1, -1, 0,  0, 0, 0,  -1, 0, 0,
    
    0, -1, 0,  1, -1, 0,  1, 0, 0,
    0, -1, 0,  1, 0, 0,  0, 0, 0,

    -1, 0, 0,  0, 0, 0,  0, 1, 0,
    -1, 0, 0,  0, 1, 0,  -1, 1, 0,

    0, 0, 0,  1, 0, 0,  1, 1, 0,
    0, 0, 0,  1, 1, 0,  0, 1, 0
];

const UVS = [
    0, 0,  0.5, 0,  0.5, 0.5,
    0, 0,  0.5, 0.5,  0, 0.5,

    0.5, 0,  1, 0,  1, 0.5,
    0.5, 0,  1, 0.5,  0.5, 0.5,

    0, 0.5,  0.5, 0.5,  0.5, 1,
    0, 0.5,  0.5, 1,  0, 1,

    0.5, 0.5,  1, 0.5,  1, 1,
    0.5, 0.5,  1, 1,  0.5, 1
];

const tmpVec2 = new THREE.Vector2(0, 1);

export default class Scrollies {
    constructor(renderer) {
        this.geom = new THREE.BufferGeometry();

        const vertices = [];
        const colors = [];
        const uvs = [];
        const posns = [];
        const nums = [];

        for (let y = 0; y < GPU_SIZE; y++) {
            for (let x = 0; x < GPU_SIZE; x++) {
                const i = (x + (y * GPU_SIZE)) % GPU_SIZE;

                const c = Math.random();
                VERTICES.forEach(
                    vert => {
                        vertices.push(vert);
                        colors.push(c);
                    }
                );

                const g = i % GLYPH_COUNT;
                UVS.forEach(
                    (uv, idx) => {
                        uvs.push(
                            (idx % 2)
                            ? uv
                            : (uv + g) / GLYPH_COUNT
                        );
                        posns.push(
                            (idx % 2)
                            ? x / GPU_SIZE
                            : y / GPU_SIZE
                        );
                    }
                );

                nums.push(i);
            }
        }

        this.geom.setAttribute(
            'position',
            new THREE.BufferAttribute(
                new Float32Array(vertices),
                3
            )
        );

        this.geom.setAttribute(
            'color',
            new THREE.BufferAttribute(
                new Float32Array(colors),
                3
            )
        );

        this.geom.setAttribute(
            'uv',
            new THREE.BufferAttribute(
                new Float32Array(uvs),
                2
            )
        );

        this.geom.setAttribute(
            'posn',
            new THREE.BufferAttribute(
                new Float32Array(posns),
                2
            )
        );

        this.geom.setAttribute(
            'num',
            new THREE.BufferAttribute(
                new Float32Array(nums),
                1
            )
        );

        console.log(this.geom)


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
        };console.log(glyphs)

        this.uniforms = {
            t: { value: 0, type: 'f' },
            dt: { value: 0, type: 'f' },
            s: { value: 0, type: 'f' },
            ds: { value: 0, type: 'f' },
            n: { value: 0, type: 'i' },
            hasInput,
            velocityInput,
            positionInput,
            glyphs: { value: glyphs, type: 't' }
        };

        this.gpuUniforms = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
        };

        this.size = { x: 0, y: 0 };
        this.center = { x: 0, y: 0 };

        this.initMesh();
        this.initComputeRenderer(renderer);
    }

    initMesh() {
        this.mesh = new THREE.Mesh(
            this.geom,
            new THREE.ShaderMaterial({
                uniforms: {
                    ...this.uniforms,
                    ...this.gpuUniforms
                },
                vertexShader: `
                uniform sampler2D texturePosition;
                uniform sampler2D textureVelocity;

                attribute vec2 posn;
                attribute vec3 color;
                attribute float num;
                
                varying vec3 vColor;
                varying vec2 vuv;
                varying float vnum;
                
                void main() {
                    vec3 newPosn = position;

                    vec3 pos = texture2D( texturePosition, posn ).xyz;
                    vec3 velocity = normalize(texture2D( textureVelocity, posn ).xyz);


                    float xy = length( velocity.xy );
                    float cosr = velocity.x / xy;
                    float sinr = -velocity.y / xy;

                    mat3 rot = mat3(
                        cosr, -sinr, 0.,
                        sinr, cosr, 0.,
                        0., 0., 1.
                    );


                    float thetas = posn.x + posn.y + abs(pos.x)/5. + pos.y/3. + .5*newPosn.x;
                    float coss = cos(thetas);
                    float sins = sin(thetas);

                    /* mat3 spiny = mat3(
                        coss, 0., sins,
                        0., 1., 0.,
                        -sins, 0., coss
                    ) */; 
                    mat3 spinx = mat3(
                        1., 0., 0.,
                        0., coss, -sins,
                        0., sins, coss
                    );

                    newPosn = rot /* * spiny */ * spinx * newPosn;

                    /*
                    float x = sin(pos.y);
                    float y = cos(pos.x);

                    newPosn.x += x;
                    newPosn.y += y; 
                    */

                    newPosn += pos;

                    gl_Position = projectionMatrix * viewMatrix * vec4(newPosn, 1.0);

                    vuv = uv;
                    vColor = color;
                    vnum = num;
                }
                `,
                fragmentShader: `
                varying vec3 vColor;
                varying vec2 vuv;
                varying float vnum;

                uniform sampler2D glyphs;
                
                void main() {
                    gl_FragColor = vec4(
                        /* vColor *  */texture2D( glyphs, vuv ).xyz,
                        /* 0.5 +  */texture2D( glyphs, vuv ).w
                    );
                }
                `,
                transparent: true,
                depthTest: false,
                side: THREE.DoubleSide
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
            posnArr[ i + 1 ] = 0;
            posnArr[ i + 2 ] = -1000000; // offscreen
            posnArr[ i + 3 ] = 0;

            veloArr[ i + 0 ] = 0;
            veloArr[ i + 1 ] = 0;
            veloArr[ i + 2 ] = 0;
            veloArr[ i + 3 ] = 0;
        }


        this.posnVar = this.computer.addVariable(
            'texturePosition',
            `
            uniform float t;
            uniform float dt;
            uniform float s;
            uniform float ds;
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

                vec4 velocity = doInput > 0.0
                    ? vec4(0., 0., 0., 0.)
                    : texture2D( textureVelocity, uv );

                //float sway = velocity.w;

                //position.x += sin(2.0 * t + (sway * 47.0)) / 15.0;

                //position.y += ds / 2.;
    
                gl_FragColor = vec4( position + velocity.xyz * dt * 15., 1.0 );
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
            uniform float ds;

            uniform sampler2D hasInput;
            uniform sampler2D velocityInput;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;

                // check previous
                vec4 tmpVelo = texture2D( textureVelocity, uv );
                // check input buffer
                vec4 inputVelo = texture2D( velocityInput, uv );
                float doInput = texture2D( hasInput, uv ).y;
                // pick buffer vs previous
                vec4 velocity = doInput > 0.0 ? inputVelo : tmpVelo;

                vec4 position = texture2D( texturePosition, uv );

                //velocity.x *= 1.01;
                //velocity.y *= 1.01;
                if (position.x > -10.0 && position.x < 10.0) {
                    if (position.x < -0.1) {
                        velocity.x -= 0.01;
                    } else if (position.x > 0.1) {
                        velocity.x += 0.01;
                    }

                    if (position.y > position.x) {
                        velocity.y -= 0.01;
                    }
                } else {
                    velocity.y *= 1.001;
                }

                velocity.y += ds / 20.;

                gl_FragColor = velocity;
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

        s = s * this.size.y;
        this.uniforms.ds.value = s - this.uniforms.s.value;
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

        if (s > 1/*  && Math.random() > 0.5 */) {
            this.add((0.5 - Math.random()) * 20, 0);
            this.add((0.5 - Math.random()) * 20, 0);
        }
    }

    next = 0;

    add(x, y) {
        this.uniforms.hasInput.value.image.data[this.next * 4 + 0] = 1;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 1] = 1;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 2] = 0;
        this.uniforms.hasInput.value.image.data[this.next * 4 + 3] = 0;
        this.uniforms.hasInput.value.needsUpdate = true;
        
        const posnArr = this.uniforms.positionInput.value.image.data;

        posnArr[this.next * 4 + 0] = this.center.x + x;
        posnArr[this.next * 4 + 1] = this.center.y + y;
        posnArr[this.next * 4 + 2] = 0;
        posnArr[this.next * 4 + 3] = 0;
        this.uniforms.positionInput.value.needsUpdate = true;
        
        const veloArr = this.uniforms.velocityInput.value.image.data;

        tmpVec2.random();

        veloArr[this.next * 4 + 0] = (0.5 - Math.random()) * 2 * tmpVec2.x;
        veloArr[this.next * 4 + 1] = tmpVec2.y;
        veloArr[this.next * 4 + 2] = 0;
        veloArr[this.next * 4 + 3] = Math.random();
        this.uniforms.velocityInput.value.needsUpdate = true;

        this.next = (this.next + 1) % SCROLLIE_COUNT;
    }

    resize(height, width, cy) {
        this.size.x = width;
        this.size.y = height;

        this.center.y = cy;
    }
}