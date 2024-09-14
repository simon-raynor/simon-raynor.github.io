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


        const inputbuffer = {
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
            ds: { value: 0, type: 'f' },
            inputbuffer,
            glyphs: { value: glyphs, type: 't' },
            flowfield: { value: null, type: 't' },
            height: { value: 0, type: 'f' },
            width: { value: 0, type: 'f' },
            scrollheight: { value: 0, type: 'f' },
        };

        this.gpuUniforms = {
            texturePosnVelo: { value: null },
        };

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
                uniform sampler2D texturePosnVelo;
                uniform sampler2D flowfield;

                uniform float s;
                uniform float height;
                uniform float width;
                uniform float scrollheight;

                attribute vec2 posn;
                attribute vec3 color;
                attribute float num;
                
                varying vec3 vColor;
                varying vec2 vuv;
                varying float vnum;
                varying vec2 vflow;
                
                void main() {
                    vec3 newPosn = position;

                    vec3 pos = vec3(texture2D( texturePosnVelo, posn ).xy, 0.);
                    vec3 velocity = vec3(normalize(texture2D( texturePosnVelo, posn ).zw), 0.);



                    float halfwidth = width / 2.;
                    float halfheight = height / 2.;
                    vec2 flowUV = vec2(
                        (((pos.x + halfwidth)) / height) / scrollheight,
                        s + (((halfheight - pos.y) / height) / scrollheight)
                    );
                    vflow = texture2D( flowfield, flowUV ).xy;



                    float xy = length( velocity.xy );
                    float cosr = velocity.x / xy;
                    float sinr = -velocity.y / xy;

                    if (velocity.x < 0.) {
                        cosr *= -1.;
                        sinr *= -1.;
                    }

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
                varying vec2 vflow;

                uniform sampler2D glyphs;
                
                void main() {
                    gl_FragColor = vec4(
                        /* vColor *  */texture2D( glyphs, vuv ).xyz,
                        texture2D( glyphs, vuv ).w
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

        const posnVeloTexture = this.computer.createTexture();

        const posnVeloArr = posnVeloTexture.image.data;
        for (let i = 0, l = posnVeloArr.length; i < l; i += 4) {
            posnVeloArr[i + 0] = 1000; // offscreen
            posnVeloArr[i + 1] = 1000; // offscreen
            posnVeloArr[i + 2] = 0;
            posnVeloArr[i + 3] = 0;
        }

        this.posnVeloVar = this.computer.addVariable(
            'texturePosnVelo',
            `
            uniform float t;
            uniform float dt;
            uniform float s;
            uniform float ds;
            uniform float height;
            uniform float width;
            uniform float scrollheight;

            uniform sampler2D inputbuffer;
            uniform sampler2D flowfield;

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;

                vec4 existing = texture2D( texturePosnVelo, uv );
                vec4 buffered = texture2D( inputbuffer, uv );

                bool doInput = buffered.x != 0. || buffered.y != 0. || buffered.z != 0. || buffered.w != 0.;

                vec4 value = doInput ? buffered : existing;

                vec2 posn = value.xy;
                vec2 velo = value.zw;

                // convert posn to a UV on the flowfield
                float halfwidth = width / 2.;
                float halfheight = height / 2.;

                vec2 flowUV = vec2(
                    (((posn.x + halfwidth)) / height) / scrollheight,
                    s + (((halfheight - posn.y) / height) / scrollheight)
                );
                vec2 flow = texture2D( flowfield, flowUV ).xy;

                // don't run the calcs if we've read from the buffer this tick
                if (!doInput) {
                    if (velo.x != 0. || velo.y != 0.) {
                        velo += flow;

                        velo.y += ds * 20.;

                        if (length(velo) > 3.) {
                            velo *= 3. / length(velo);
                        }
                    }

                    posn += velo * dt * 10.;

                    value = vec4(posn, velo);
                }

                gl_FragColor = value;
            }
            `
        );

        this.computer.setVariableDependencies( this.posnVeloVar, [ this.posnVeloVar ]);
        this.posnVeloVar.material.uniforms = this.uniforms;
        this.posnVeloVar.wrapS = THREE.RepeatWrapping;

        const error = this.computer.init();
        if (error !== null) console.error(error);
    }

    tick(dt, s) {
        if (isNaN(dt) || !this.computer) return;

        this.uniforms.t.value += dt;
        this.uniforms.dt.value = dt;
        
        this.uniforms.ds.value = s - this.uniforms.s.value;
        this.uniforms.s.value = s;

        this.computer.compute();

        this.gpuUniforms.texturePosnVelo.value = this.computer.getCurrentRenderTarget(
            this.posnVeloVar
        ).texture;

        this.uniforms.inputbuffer.value.image.data.fill(0);
        this.uniforms.inputbuffer.value.needsUpdate = true;

        if (s > 0.015) {
            this.add((0.5 - Math.random()) * 25, 0);
            this.add((0.5 - Math.random()) * 25, 0);
        }
    }

    next = 0;

    add(x, y) {
        const inputArr = this.uniforms.inputbuffer.value.image.data;
        
        tmpVec2.random();

        inputArr[this.next * 4 + 0] = this.center.x + x;
        inputArr[this.next * 4 + 1] = this.center.y + y;
        inputArr[this.next * 4 + 2] = (0.5 - Math.random()) * 2 * tmpVec2.x;
        inputArr[this.next * 4 + 3] = tmpVec2.y;
        
        this.uniforms.inputbuffer.value.needsUpdate = true;

        this.next = (this.next + 1) % SCROLLIE_COUNT;
    }

    resize(height, width, scrollheight, cy) {
        this.uniforms.height.value = height;
        this.uniforms.width.value = width;
        this.uniforms.scrollheight.value = scrollheight;

        this.center.y = cy;
    }

    setFlowField(ffield) {
        this.uniforms.flowfield.value = ffield;
        this.uniforms.flowfield.value.needsUpdate = true;
    }
}