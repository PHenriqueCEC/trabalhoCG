import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import GUI from '../libs/util/dat.gui.module.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js'
import {
    initRenderer,
    initDefaultSpotlight,
    createGroundPlaneXZ,
    setDefaultMaterial,
    onWindowResize,
    initCamera,
} from "../libs/util/util.js";

let scene, renderer, light, camera, keyboard, material, clock;
scene = new THREE.Scene(); // Create main scene
clock = new THREE.Clock();

renderer = initRenderer(); // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 15.0, 5.0)); // Use default light
material = setDefaultMaterial(); // create a basic material
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position

var mixer = new Array();
var direction = 5  //variavel para gravar a posição para onde o boneco aponta são 8 posições de 0 a 7
var new_direction = 5
var certo = true;

window.addEventListener("resize", function () { onWindowResize(camera, renderer); }, false);
keyboard = new KeyboardState();

var groundPlane = createGroundPlaneXZ(10, 10, 40, 40); // width, height, resolutionW, resolutionH
scene.add(groundPlane);


let camPos = new THREE.Vector3(5, 4, 8);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.0, 0.0);

camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

let holder = new THREE.Object3D()
scene.add(holder)
holder.add(camera)

let manholder = new THREE.Object3D()

var man = null;

var loader = new GLTFLoader();
loader.load('../assets/objects/walkingMan.glb', function (gltf) {
    man = gltf.scene;
    man.traverse(function (child) {
        if (child) {
            child.castShadow = true;
        }
    });
    man.traverse(function (node) {
        if (node.material) node.material.side = THREE.DoubleSide;
    });

    manholder.add(man);
    holder.add(manholder)

    // Create animationMixer and push it in the array of mixers
    var mixerLocal = new THREE.AnimationMixer(man);
    mixerLocal.clipAction(gltf.animations[0]).play();
    mixer.push(mixerLocal);
});

buildInterface();
render();

function changeProjection() {
    // Store the previous position of the camera
    if (camera instanceof THREE.PerspectiveCamera) {
        var s = 72; // Estimated size for orthographic projection
        camera = new THREE.OrthographicCamera(-window.innerWidth / s,           //left
            window.innerWidth / s,                                              //right
            window.innerHeight / (s - 10),                                      //top
            window.innerHeight / (-s - 10),                                     //bottom
            -s,                                                                 //near
            s);                                                                 //far
    } else {
        // PerspectiveCamera( fov, aspect, near, far)
        camera = new THREE.PerspectiveCamera(
            45,                                                                 // fov
            window.innerWidth / window.innerHeight,                             // aspect
            0.1,                                                                // near
            1000                                                                // far
        );
    }

    camera.position.copy(camPos);
    camera.up.copy(camUp);
    camera.lookAt(camLook);
    holder.add(camera);
}
function buildInterface() {

    // Interface
    var controls = new function () {
        this.viewAxes = false;
        this.onChangeProjection = function () {
            changeProjection();
        };
    };
    // GUI interface
    var gui = new GUI();
    gui.add(controls, 'onChangeProjection').name("Change Projection");
}
function rotate() {
    if (new_direction != direction) {
        certo = false

        let aux = direction - new_direction;
        let rot = aux; // variavel de rotação
        if (Math.abs(aux) > 4) { //vê se é o caminho mais longo
            rot = 4 - (Math.abs(aux) - 4) //descobre o caminha mais curto
            rot = (Math.abs(aux) / aux) // arruma o sentido do caminho mais curto
        }

        manholder.rotateY(THREE.MathUtils.degToRad(45 * 0.5));
        direction = direction + 0.5;
        direction %= 8;
        console.log(direction, new_direction);
    }

    if ((direction >= (new_direction - 0.5)) && (direction <= (new_direction + 0.5))) {
        direction = new_direction;
        certo = true
    };
    console.log(direction);
}
function keyboardUpdate() {
    keyboard.update()

    if ((keyboard.pressed('W') || keyboard.pressed('up')) && (keyboard.pressed('D') || keyboard.pressed('right'))) {//1
        holder.translateX(0.07);
        holder.translateZ(-0.07);
        new_direction = 1;
    } else if ((keyboard.pressed('W') || keyboard.pressed('up')) && (keyboard.pressed('A') || keyboard.pressed('left'))) {//7
        holder.translateX(-0.07);
        holder.translateZ(-0.07);
        new_direction = 7;
    } else if ((keyboard.pressed('S') || keyboard.pressed('down')) && (keyboard.pressed('D') || keyboard.pressed('right'))) {//3
        holder.translateX(0.07);
        holder.translateZ(0.07);
        new_direction = 3;
    } else if ((keyboard.pressed('S') || keyboard.pressed('down')) && (keyboard.pressed('A') || keyboard.pressed('left'))) {//5
        holder.translateX(-0.07);
        holder.translateZ(0.07);
        new_direction = 5;
    } else if
        (keyboard.pressed('W') || keyboard.pressed('up')) {//0
        holder.translateZ(-0.1);
        new_direction = 0;
    } else if (keyboard.pressed('S') || keyboard.pressed('down')) {//4
        holder.translateZ(+0.1);
        new_direction = 4;
    } else if (keyboard.pressed('D') || keyboard.pressed('right')) {//2
        holder.translateX(0.1);
        new_direction = 2;
    } else if (keyboard.pressed('A') || keyboard.pressed('left')) {//6
        holder.translateX(-0.1);
        new_direction = 6;
    }
}

function keyboardOn() {
    if (keyboard.pressed('W') || keyboard.pressed('up')
        || keyboard.pressed('S') || keyboard.pressed('down')
        || keyboard.pressed('D') || keyboard.pressed('right')
        || keyboard.pressed('A') || keyboard.pressed('left')) {
        return true;
    } else {
        return false
    }
}


function render() {

    var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.

    requestAnimationFrame(render);

    renderer.render(scene, camera);

    rotate()

    keyboardUpdate();
    // Render scene

    if (keyboardOn()) {
        for (var i = 0; i < mixer.length; i++)
            mixer[i].update(delta * 2);
    }
}
