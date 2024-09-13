import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import Scollies from './scrollies.js';


const stats = new Stats();
document.body.appendChild( stats.dom );


const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearAlpha(0);
//renderer.shadowMap.enabled = true;


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

camera.position.set(0, 0, 4000);
camera.lookAt(scene.position);


// use these to convert HTML/CSS coords to 3D ones
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({
        color: 0x442211,
        visible: false
    })
);
scene.add(floor)

const raycaster = new THREE.Raycaster();


const scrollies = new Scollies(renderer);
scene.add(scrollies.mesh);


// N.B. filled in domReady
let elWrapper;


const MAX_ANGLE = 150;

function setAngle(t) { elWrapper.style.setProperty('--theta', Math.min(t, MAX_ANGLE)); }



let paused = false;
const pauseBtn = document.createElement('button');
function togglePause() {
    paused = !paused;
    pauseBtn.classList.toggle('headscroll--pausebtn--paused');
}
pauseBtn.addEventListener('click', togglePause);
pauseBtn.classList.add('headscroll--pausebtn');
pauseBtn.textContent = 'Pause';
pauseBtn.setAttribute('aria-label', 'Pause');



let t = 0;
let s = 0;


function animate(_t) {
    const dt = (_t - t) / 1000;
    t = _t;

    requestAnimationFrame(animate);

    if (!paused) {
        scrollies.tick(dt, s);
    }

    stats.update();
    renderer.render( scene, camera );

    setAngle(s);
}


let open = false;
function doOpen() {
    open = true;

    // trigger CSS
    elWrapper.classList.add('headscroll--open');

    // set origin for particles
    const bbox = elWrapper.querySelector('.headscroll--head').getBoundingClientRect();

    raycaster.setFromCamera(
        {
            x: 0,
            y: ((window.innerHeight/2) - bbox.top) / (window.innerHeight/2)
        },
        camera
    );

    const hits = raycaster.intersectObject(floor, false);

    scrollies.setCentreY(hits[0].point.y);
}

function doClose() {
    open = false;

    // trigger CSS
    elWrapper.classList.remove('headscroll--open');
}


function scroll() {
    s = window.scrollY;

    if (!open && s) {
        doOpen();
    } else if (!s && open) {
        doClose();
    }
}


function domReady() {
    elWrapper = document.querySelector('.headscroll');
    elWrapper.appendChild(renderer.domElement);
    elWrapper.appendChild(pauseBtn);

    window.addEventListener('scroll', scroll);

    /* window.onclick = () => {
        scrollies.add(5 - (Math.random() * 10), 2 - (Math.random() * 4));
    } */
}

document.addEventListener('DOMContentLoaded', domReady);


function onLoad() {
    animate(Performance.now);
}

window.addEventListener('load', onLoad);