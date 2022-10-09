import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import GUI from '../libs/util/dat.gui.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js'
import {
    initTrackballControls,
    initRenderer,
    initDefaultSpotlight,
    createGroundPlaneXZ,
    setDefaultMaterial,
    onWindowResize,
    initCamera,
} from "../libs/util/util.js";
import { Vector3 } from "../build/three.module.js";

let scene, renderer, light, camera, keyboard, material, clock;
scene = new THREE.Scene(); // Create main scene
clock = new THREE.Clock();

renderer = initRenderer(); // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(5.0, 15.0, 5.0)); // Use default light
material = setDefaultMaterial(); // create a basic material
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position

var trackballControls = new TrackballControls(camera, renderer.domElement);



var direction = 5  //variavel para gravar a posição para onde o boneco aponta são 8 posições de 0 a 7

window.addEventListener("resize", function () { onWindowResize(camera, renderer); }, false);
keyboard = new KeyboardState();

var groundPlane = createGroundPlaneXZ(10, 10, 40, 40); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

let camPos = new THREE.Vector3(5, 4, 8);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0.0, 0.0, 0.0);

// camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );
var s = 72; // Estimated size for orthographic projection
camera = new THREE.OrthographicCamera(-window.innerWidth / s,           //left
    window.innerWidth / s,                                              //right
    window.innerHeight / (s - 10),                                      //top
    window.innerHeight / (-s - 10),                                     //bottom
    -s,                                                                 //near
    s);

camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

let auxilio = new THREE.Object3D()
// auxilio.position.set(new THREE.Vector3(0.0, 0.0, 0.0))
scene.add(auxilio)
auxilio.add(camera)


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

    auxilio.add(man);
    // Only fix the position of the centered object
    // The man around will have a different geometric transformation
    // man = obj
    // man.add(camera);
    // Create animationMixer and push it in the array of mixers
    var mixerLocal = new THREE.AnimationMixer(man);
    mixerLocal.clipAction(gltf.animations[0]).play();
    mixer.push(mixerLocal);
}, onProgress, onError);


var mixer = new Array();





buildInterface();
render();

function onError() { };

function onProgress(xhr, model) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
    }
}

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



    camera.position.copy(new Vector3(auxilio.position.x + 5, auxilio.position.y + 4, 8));
    camera.up.copy(new Vector3(0, 1, 0));
    camera.lookAt(auxilio.position);

    auxilio.add(camera)


    // let camPos = new THREE.Vector3(5, 4, 8);
    // let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
    // let camLook = new THREE.Vector3(0.0, 0.0, 0.0);

    trackballControls = initTrackballControls(camera, renderer);
    lightFollowingCamera(light, camera) // Makes light follow the camera
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
function rotate(new_direction) {
    if (man) {
        var mat4 = new THREE.Matrix4();
        man.matrixAutoUpdate = false;
        man.matrix.identity();  // reset matrix
        man.matrix.multiply(mat4.makeRotationY(THREE.MathUtils.degToRad(45 * (direction - new_direction))));
        // direction = new_direction;
    }
}
function keyboardUpdate() {
    keyboard.update()

    if ((keyboard.pressed('W') || keyboard.pressed('up')) && (keyboard.pressed('D') || keyboard.pressed('right'))) {//2
        auxilio.translateX(0.07);
        auxilio.translateZ(-0.07);
        rotate(2)
    } else if ((keyboard.pressed('W') || keyboard.pressed('up')) && (keyboard.pressed('A') || keyboard.pressed('left'))) {//8
        auxilio.translateX(-0.07);
        auxilio.translateZ(-0.07);
        rotate(8)
    } else if ((keyboard.pressed('S') || keyboard.pressed('down')) && (keyboard.pressed('D') || keyboard.pressed('right'))) {//4
        auxilio.translateX(0.07);
        auxilio.translateZ(0.07);
        rotate(4)
    } else if ((keyboard.pressed('S') || keyboard.pressed('down')) && (keyboard.pressed('A') || keyboard.pressed('left'))) {//6
        auxilio.translateX(-0.07);
        auxilio.translateZ(0.07);
        rotate(6)
    } else if
        (keyboard.pressed('W') || keyboard.pressed('up')) {//1
        auxilio.translateZ(-0.1);
        rotate(1)
    } else if (keyboard.pressed('S') || keyboard.pressed('down')) {//5
        auxilio.translateZ(+0.1);
        rotate(5)
    } else if (keyboard.pressed('D') || keyboard.pressed('right')) {//3
        auxilio.translateX(0.1);
        rotate(3)
    } else if (keyboard.pressed('A') || keyboard.pressed('left')) {//7
        auxilio.translateX(-0.1);
        rotate(7)
    }
}

function keyboardOn() {
    if (keyboard.pressed('W') || keyboard.pressed('up')
        || keyboard.pressed('S') || keyboard.pressed('down')
        || keyboard.pressed('D') || keyboard.pressed('right')
        || keyboard.pressed('A') || keyboard.pressed('left')) {
        return true;
    } else { return false }

}


function render() {
    keyboardUpdate();
    // Render scene
    var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.
    trackballControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    // Animation control
    if (keyboardOn()) {
        for (var i = 0; i < mixer.length; i++)
            mixer[i].update(delta * 2);
    }
}
