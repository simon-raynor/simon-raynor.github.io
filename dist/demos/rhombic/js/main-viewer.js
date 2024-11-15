// add the bvh collision methods to the THREE classes
import './three-extended.js';
import * as THREE from 'three';
import nipplejs from 'nipplejs';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


import Stats from 'three/addons/libs/stats.module.js';
import { Cave } from './entities/cave/index.js';
//import ParticlePath from './entities/particlepath.js';
import generateAmbientVegetation from './entities/ambient-vegetation/index.js';
import ParticlePath from './entities/particles/index.js';
import Trider from './entities/trider/index.js';
import COLORS from './entities/color/index.js';
import TargetTower from './entities/towers/TargetTower.js';
import SourceTower from './entities/towers/SourceTower.js';
import Pillslug from './entities/pillslug/index.js';
import Creature from './entities/creature/index.js';
import { Camera } from './entities/camera/index.js';
import RhombicTower from './entities/towers/RhombicTower.js';
import Vine from './entities/vines/index.js';


const stats = new Stats();
document.body.appendChild( stats.dom )


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.pixelRatio = window.devicePixelRatio;
//renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);











/* const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set(3, 2, 1);
scene.add( directionalLight ); */
const light = new THREE.AmbientLight( 0x202020 ); // soft white light
//const light = new THREE.AmbientLight( 0x808080 ); // bright white light
scene.add( light );



const CAVEDIMENSION = 3;

const cave = new Cave(CAVEDIMENSION);
scene.add(cave.mesh);


/* const wf = new THREE.WireframeGeometry(cave.mesh.geometry);
const line = new THREE.LineSegments(wf, new THREE.LineBasicMaterial({ color: 0x999999 }));
scene.add(line); */

//////////////////////////
// surface grid borders //
//////////////////////////
/* const segments = [];

cave.surfaceGrid.forEach(
    cell => {
        segments.push(
            ...cell.a.toArray(),
            ...cell.b.toArray(),
            ...cell.b.toArray(),
            ...cell.c.toArray(),
            ...cell.c.toArray(),
            ...cell.a.toArray(),
        );
    }
);
const geom = new THREE.BufferGeometry();
geom.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(segments), 3)
);
const line = new THREE.LineSegments(
    geom,
    new THREE.LineBasicMaterial({ color: 0x999999 })
);
scene.add(line); */




const veg = generateAmbientVegetation(cave);
scene.add(veg);



const { point, normal } = cave.centre.getRandomPointOnMesh();

const trider = new Trider();

scene.add(trider.mesh);

trider.init(
    new THREE.Vector3().copy(point),
    new THREE.Vector3().copy(normal)
);



const centreTower = new TargetTower(
    cave.centre.getRandomGridCell()
);

const towers = [];

cave.chunks.forEach(
    chunk => {
        const cell = chunk.getRandomGridCell();

        const vine = new Vine(cell);
        towers.push(
            vine,
            new Vine(cell),
            new Vine(vine.target)
        );

        const cell2 = chunk.getRandomGridCell();

        towers.push(
            new SourceTower(
                cell2,
                centreTower,
                COLORS[Math.floor(COLORS.length * Math.random())]
                //tmpColor.setHSL(Math.random(), 1.0, 0.5).getHex()
            )
        );
    }
);

towers.map(
    t => scene.add(t.mesh)
);



const particlePathManager = new ParticlePath();

scene.add(particlePathManager.mesh);

// TODO: draw the paths w/ pathfinder

/* towers.forEach(
    tower => {
        if (tower instanceof SourceTower) {
            tower.generatePathToTarget(particlePathManager);
        }
    }
) */



const creatures = [];


for (let i = 0; i < 1; i++) {
    const chunkNo = 1 + Math.floor(Math.random() * (cave.chunks.length - 1));
    const intersect = cave.chunks[chunkNo].getRandomPointOnMesh();

    const creature = new Pillslug();

    creature.init(cave, intersect.point, intersect.normal);

    //creature.target = centreTower;
    //creature.pathfind();
        
    scene.add(creature.mesh);

    creatures.push(creature);
}

console.log(creatures)








const maincamera = new Camera();
maincamera.init(renderer, scene, cave);
scene.add(maincamera.wrapper);

//maincamera.lookAt(trider);
maincamera.wrapper.position.set(...cave.centre.worldposition.toArray());
maincamera.lookAt(trider.position, trider.up);

console.log(maincamera);


/* const controls = new OrbitControls( maincamera.instance, renderer.domElement );
//maincamera.instance.position.set(0, 30, -60);
controls.target = centreTower.position;
controls.update(); */



/* const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper ); */

/* const skelehelper = new THREE.SkeletonHelper( trider.mesh );
scene.add( skelehelper ); */

/* const ikhelper = trider.ikSolver.createHelper();
scene.add( ikhelper ); */

/* scene.add(new THREE.ArrowHelper(
    new THREE.Vector3().randomDirection().cross(normal),
    point,
    5,
    0xffffff,
    1,
    1
)); */

/* paths.forEach(
    path => {
    const pathMesh = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
            path.getPoints(1000)
        ),
        new THREE.LineDashedMaterial({ color: 0x00ff00, dashSize: 2, gapSize: 1 })
    )

    scene.add(pathMesh);
}) */



let t = Date.now();

let slowfactor = 1;

const moving = {vector: new THREE.Vector3(0, 1), force: 0};


function tick() {
    const nextframe = requestAnimationFrame(tick);

    const now = Date.now();
    const dt = (now - t) / (1000 * slowfactor);
    t = now;

    if (dt >= 1) {
        pause(nextframe);
    }

    tickGame(dt);

    stats.update();
    //controls.update();

    maincamera.tick(dt);

}


let pathMesh = null;

function tickGame(dt) {
    trider.tick(dt, cave.mesh, moving);
    //trider2.tick(dt, cave.mesh, moving);

    towers.forEach(t => t.tick(dt, trider));

    particlePathManager.tick(dt);

    creatures.forEach(c => c.tick(dt));

    /* if (!pathMesh && creature.path) {
        pathMesh = drawPath(creature.path);
        scene.add(pathMesh);
    } */
}


const pausebutton = document.getElementById('pause');

pausebutton.addEventListener('click', () => {
    t = Date.now();
    tick();
    pausebutton.setAttribute('disabled', 'disabled');
})

function pause(nextframe) {
    cancelAnimationFrame(nextframe);
    pausebutton.removeAttribute('disabled');
}




/* for (let i = 0; i <= 100; i++) {
    tickGame(1);
} */

moving.force = 1;


setTimeout(
    () => {
        t = Date.now();
        tick();
    },
    1000
);







/* function drawPath(path) {
    const posns = [];
        
    for (let i = 1; i < path.length; i++) {
        posns.push(
            ...path[i - 1].position.toArray(),
            ...path[i].position.toArray()
        );
    }

    const pathGeom = new THREE.BufferGeometry();
    pathGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posns), 3));
    const pathMesh = new THREE.LineSegments(pathGeom, new THREE.LineBasicMaterial({ color: 0x33ff33 }));
    
    return pathMesh;
} */