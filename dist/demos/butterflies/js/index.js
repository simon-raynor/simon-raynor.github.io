import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Butterflies from './butterflies.js';


const stats = new Stats();
document.body.appendChild( stats.dom )


const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('stage').appendChild(renderer.domElement);

const aspect = window.innerWidth / window.innerHeight;

const d = 25;

const camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    0.0001,
    20000
);

camera.position.set(0, 3000, 4000);
camera.lookAt(scene.position);



const controls = new OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3(0, 0, 0);
controls.update();





const composer = new EffectComposer( renderer );

const PIXEL_SIZE = 1;
const pixelPass = new RenderPixelatedPass(
    PIXEL_SIZE * window.devicePixelRatio,
    scene,
    camera
);
pixelPass.normalEdgeStrength = 0.05;
pixelPass.depthEdgeStrength = 0.1;

composer.addPass(
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

composer.addPass(bloomPass);

composer.addPass(
    new OutputPass()
);





const alight = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( alight );

const dlight = new THREE.DirectionalLight( 0xffffff, 1 );
dlight.position.set(10, 1000, 100);
scene.add( dlight );



const content = document.getElementById('content');
content.style.display = 'none'; // TODO: better to hide offscreen?



const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({
        color: 0x442211,
        visible: false
    })
);
floor.rotateX(-Math.PI / 2);

scene.add(floor);

composer.render( scene, camera );




const screenCorners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
];

const raycaster = new THREE.Raycaster();

const planeCorners = screenCorners.map(
    ([x, y]) => {
        raycaster.setFromCamera({x, y}, camera);

        const hits = raycaster.intersectObject(floor, false);
        console.log([x, y], hits);

        if (hits[0]) {
            return new THREE.Vector3().copy(hits[0].point);
        }
    }
);

const minx = Math.min.apply(null, planeCorners.map(v => v.x));
const minz = Math.min.apply(null, planeCorners.map(v => v.z));
const maxx = Math.max.apply(null, planeCorners.map(v => v.x));
const maxz = Math.max.apply(null, planeCorners.map(v => v.z));




const butterflies = new Butterflies(20);

butterflies.setBounds(
    minx,
    maxx,
    minz,
    maxz
);

Butterflies.fetchShaders().then(
    () => {
        butterflies.initMesh();
        butterflies.initComputeRenderer(renderer);

        scene.add(butterflies.mesh);
    }
);





let t = 0;

function animate(_t) {
    const dt = (_t - t) / 1000;
    t = _t;

    requestAnimationFrame(animate);



    //controls.update();
    stats.update();

    butterflies.tick(dt);


    //renderer.render( scene, camera );
    composer.render( scene, camera );
}

animate(t);