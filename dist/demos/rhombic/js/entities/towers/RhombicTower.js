import * as THREE from 'three';
import COLORS from '../color/index.js';


const twoOverRtFive = 2 / Math.sqrt(5);
const x = Math.sqrt(2 - twoOverRtFive);
const y = Math.sqrt(2 + twoOverRtFive);

const depth = y * 8;

/* const geom = new THREE.ExtrudeGeometry(
    new THREE.Shape(
        [
            new THREE.Vector2(0, x),
            new THREE.Vector2(y, 0),
            new THREE.Vector2(0, -x),
            new THREE.Vector2(-y, 0),
        ]
    ),
    {
        depth,
        bevelEnabled: false
    }
);
geom.rotateX(-Math.PI / 2); */



const vertices = [
    // top
    x, 0, 0,
    0, 0, y,
    -x, 0, 0,

    -x, 0, 0,
    0, 0, -y,
    x, 0, 0,

    // bottom
    -x, 0, 0,
    0, 0, y,
    x, 0, 0,

    x, 0, 0,
    0, 0, -y,
    -x, 0, 0,
];

const normals = [
    0, 1, 0,  0, 1, 0, 0, 1, 0,
    0, 1, 0,  0, 1, 0, 0, 1, 0,

    0, -1, 0,  0, -1, 0, 0, -1, 0,
    0, -1, 0,  0, -1, 0, 0, -1, 0,
];

const barycoords = [
    1, 0, 0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, -1, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0, 0, 1,
    0, 0, 1, 0, -1, 0, 1, 0, 0,
];


const geom = new THREE.BufferGeometry();
geom.setAttribute(
    'position',
    new THREE.BufferAttribute(
        new Float32Array(vertices),
        3
    )
);
/* geom.setAttribute(
    'normal',
    new THREE.BufferAttribute(
        new Float32Array(normals),
        3
    )
); */
geom.setAttribute(
    'barycoord',
    new THREE.BufferAttribute(
        new Float32Array(barycoords),
        3
    )
);

const vertexShader = `
uniform float t;

attribute vec3 barycoord;

varying vec3 vBarycoord;
varying vec3 vColor;

void main() {
    vec3 bounce = vec3(0.0, sin(instanceMatrix[3][1] + t * 2.0) / 2.0, 0.0);

    float cosSpin = cos(instanceMatrix[3][1] + t);
    float sinSpin = sin(instanceMatrix[3][1] + t);
    float wobbleAngle = cos(instanceMatrix[3][1] + t * 0.5) / 4.0;
    float cosWobble = cos(wobbleAngle);
    float sinWobble = sin(wobbleAngle);

    mat3 wobble = mat3(
        cosSpin, 0.0, sinSpin,
        0.0, 1.0, 0.0,
        -sinSpin, 0.0, cosSpin )
        * mat3(
        cosWobble, -sinWobble, 0.0,
        sinWobble, cosWobble, 0.0,
        0.0, 0.0, 1.0 );

    vBarycoord = barycoord;
    vColor = instanceColor;

    gl_Position = modelViewMatrix * instanceMatrix * vec4(wobble * position + bounce, 1.0) * projectionMatrix;
}
`;

const fragmentShader = `
uniform float t;

varying vec3 vBarycoord;
varying vec3 vColor;

void main() {
    float edgeProximity = abs(vBarycoord.x - vBarycoord.z) + abs(vBarycoord.y);
    float colored = step(0.8, edgeProximity);
    gl_FragColor = vec4(colored * vColor, 1.0);
}
`;







const tmpObj3d = new THREE.Object3D();
const tmpQuat = new THREE.Quaternion();
const STD_UP = new THREE.Vector3(0, 1, 0);


const PER_TOWER = 12;



export default class RhombicTower {
    #uniforms = null;

    get position() {
        return this.mesh.position;
    }

    constructor() {
        this.#uniforms = {
            t: { value: 0, type: 'f' },
        }

        const material = new THREE.ShaderMaterial({
            uniforms: this.#uniforms,
            vertexShader,
            fragmentShader,
            transparent: true
        });

        this.mesh = new THREE.InstancedMesh(
            geom,
            material,
            PER_TOWER
        );
        this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

        for (let i = PER_TOWER; i > 0; i--) {
            tmpObj3d.position.set(0, i / 2, 0);
            tmpObj3d.updateMatrix();
            
            this.mesh.setMatrixAt( PER_TOWER - i, tmpObj3d.matrix );
            this.mesh.setColorAt(
                PER_TOWER - i,
                new THREE.Color(COLORS[Math.floor(COLORS.length * Math.random())])
            );
        }

    }

    init(position, normal) {
        this.position.copy(position);
        this.normal = new THREE.Vector3().copy(normal);

        tmpQuat.setFromUnitVectors(
            STD_UP,
            this.normal
        );
        this.mesh.applyQuaternion(tmpQuat);
    }

    tick(dt) {
        this.#uniforms.t.value += dt;
    }
}