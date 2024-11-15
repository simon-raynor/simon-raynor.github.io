import * as THREE from 'three';
import noise from '../../lib/noise.js';

const HEIGHT = 1;


const path = [
    new THREE.Vector2( HEIGHT / 15, 0 ),
    new THREE.Vector2( HEIGHT / 16, HEIGHT * 0.75 ),
    new THREE.Vector2( HEIGHT, HEIGHT * 0.725 ),
    new THREE.Vector2( 0, HEIGHT )
];
const plantgeom = new THREE.LatheGeometry(path, 5)


//const plantgeom = new THREE.ConeGeometry(HEIGHT / 12, HEIGHT, 5, 1, true);
//const plantgeom = new THREE.BoxGeometry(HEIGHT, HEIGHT, HEIGHT);
//plantgeom.translate(0, HEIGHT / 2, 0);
const material = new THREE.MeshPhongMaterial({
    color: 0x88aa99
})


const raycaster = new THREE.Raycaster();
const tmpVec3 = new THREE.Vector3();
const tmpVec3A = new THREE.Vector3();
const tmpVec3B = new THREE.Vector3();
const tmpVec3C = new THREE.Vector3();

export default function generateAmbientVegetation(cave) {    
    const { position, normal } = cave.geometry.attributes;

    const positions = [],
        normals = [],
        sizes = [];

    //noise.seed(Math.random());

    for (let i = 0; i <= position.count; i+=3) {;
        tmpVec3A.fromBufferAttribute(position, i)
        tmpVec3B.fromBufferAttribute(position, i + 1);
        tmpVec3C.fromBufferAttribute(position, i + 2);
        const triangle = new THREE.Triangle(tmpVec3A, tmpVec3B, tmpVec3C);
        triangle.getMidpoint(tmpVec3);

        const noiseval = noise.simplex3(...tmpVec3.toArray());

        if (noiseval > 0) {
            const [p, n, s] = generatePatch(
                triangle,
                //noiseval,
            );
            positions.push(...p);
            normals.push(...n);
            sizes.push(...s);
        }
    }

    const mesh = new THREE.InstancedMesh(
        plantgeom,
        material,
        positions.length
    );

    const tmpObj = new THREE.Object3D();
    const tmpMat4 = new THREE.Matrix4();

    for (let i = 0; i < positions.length; i++) {
        tmpObj.position.set(0, 0, 0);
        tmpObj.lookAt(normals[i]);
        tmpObj.rotateX(Math.PI / 2);
        tmpObj.rotateY(Math.PI * Math.random() * 2);
        
        tmpObj.scale.set(sizes[i], sizes[i], sizes[i]);
        
        tmpObj.position.copy(positions[i]);

        tmpMat4.compose(tmpObj.position, tmpObj.quaternion, tmpObj.scale);
        mesh.setMatrixAt(i, tmpMat4);
    }

    return mesh;
}

const tmpPosn = new THREE.Vector3(),
    tmpNorm = new THREE.Vector3();

function generatePatch(
    triangle,
    weight
) {
    triangle.getMidpoint(tmpPosn);
    triangle.getNormal(tmpNorm);
    tmpNorm.negate(); // face inward

    const posns = [],
        normals = [],
        sizes = [];
    
    let n = 1 + Math.random() * 4;

    do {
        posns.push(randomInTriangle(triangle));
        normals.push(tmpNorm.clone());
        sizes.push(1 + ((Math.random() - 0.5) / 3));

        n--;
    } while (n > 0);

    return [
        posns,
        normals,
        sizes
    ];
}

// https://stackoverflow.com/a/51553388/869247
function randomInTriangle(triangle) {
    const r1 = 0.1 + (Math.random() * 0.8);
    const r2 = Math.sqrt(0.1 + (Math.random() * 0.8));
    const a = 1 - r2, b = r2 * (1 - r1), c = r1 * r2;
    return triangle.a.clone().multiplyScalar(a)
        .add(triangle.b.clone().multiplyScalar(b))
        .add(triangle.c.clone().multiplyScalar(c));
}


    
/* {
    for (let t = 0; t <= 1; t += 0.001) {
        raycaster.set(
            paths[0].getPointAt(t),
            tmpVec3.random().cross(paths[0].getTangentAt(t))
        );

        const intersects = raycaster.intersectObject(cavemesh);

        positions.push(intersects[0].point);
        normals.push(intersects[0].normal);
    }
} */