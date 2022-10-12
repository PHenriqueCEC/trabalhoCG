import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    setDefaultMaterial,
    InfoBox,
    SecondaryBox,
    onWindowResize,
    createGroundPlaneXZ,
    createGroundPlaneWired
} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial("#DEB887"); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Use to scale the cube
var scale = 1.0;


// To use the keyboard
var keyboard = new KeyboardState();

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane2 = createGroundPlaneXZ(70, 70, 1, 1, "#FFE4B5")
let plane = createGroundPlaneWired(45, 45, 20, 20)

scene.add(plane);
scene.add(plane2);

// create a cube
var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cube = new THREE.Mesh(cubeGeometry, material);
// position the cube
cube.position.set(0.0, 0.5, 0.0);
// add the cube to the scene
scene.add(cube);



insertCube();

//Criando o chão

var floorCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var auxFloorCubeGeometry = new THREE.BoxGeometry(0.9, 1, 0.9);
let materialFloorCube = setDefaultMaterial("#E6DEB3");
let materialAuxFloorCube = setDefaultMaterial("#FEF7C6")


 for (let x = -25; x <= 25; x += 1) {
    for (let z = -25; z <= 25; z += 1) {
        let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
        let auxFloorCube = new THREE.Mesh(auxFloorCubeGeometry, materialAuxFloorCube);

        floorCube.position.set(x, -0.5, z);
        scene.add(floorCube);

        floorCube.add(auxFloorCube);
        auxFloorCube.translateY(0.01);
    }

} 

var cubeAxesHelper = new THREE.AxesHelper(9);
cube.add(cubeAxesHelper);


var positionMessage = new SecondaryBox("");
positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu")

render();

function keyboardUpdate() {
    keyboard.update();
    if (keyboard.pressed("left")) cube.translateX(-1);
    if (keyboard.pressed("right")) cube.translateX(1);
    if (keyboard.pressed("up")) cube.translateY(1);
    if (keyboard.pressed("down")) cube.translateY(-1);
    if (keyboard.pressed("pageup")) cube.translateZ(1);
    if (keyboard.pressed("pagedown")) cube.translateZ(-1);

    let angle = THREE.MathUtils.degToRad(10);
    if (keyboard.pressed("A")) cube.rotateY(angle);
    if (keyboard.pressed("D")) cube.rotateY(-angle);

    if (keyboard.pressed("W")) {
        scale += .1;
        cube.scale.set(scale, scale, scale);
    }
    if (keyboard.pressed("S")) {
        scale -= .1;
        cube.scale.set(scale, scale, scale);
    }
    updatePositionMessage();
}

function updatePositionMessage() {
    var str = "POS {" + cube.position.x.toFixed(1) + ", " + cube.position.y.toFixed(1) + ", " + cube.position.z.toFixed(1) + "} " +
        "| SCL {" + cube.scale.x.toFixed(1) + ", " + cube.scale.y.toFixed(1) + ", " + cube.scale.z.toFixed(1) + "} " +
        "| ROT {" + cube.rotation.x.toFixed(1) + ", " + cube.rotation.y.toFixed(1) + ", " + cube.rotation.z.toFixed(1) + "}";
    positionMessage.changeMessage(str);
}



function insertCube() {
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cube = new THREE.Mesh(cubeGeometry, material);
    // position the cube
    cube.position.set(6.0, 0.5, 0.0);
    // add the cube to the scene
    scene.add(cube);

    var cube2 = new THREE.Mesh(cubeGeometry, material);
    cube2.position.set(8.0, 0.5, 0.0);
    scene.add(cube2);

    var cube3 = new THREE.Mesh(cubeGeometry, material);
    cube3.position.set(7.0, 0.5, 0.0);
    scene.add(cube3);

    var cube4 = new THREE.Mesh(cubeGeometry, material);
    cube4.position.set(0.0, 0.5, -12.0);
    scene.add(cube4);

    var cube5 = new THREE.Mesh(cubeGeometry, material);
    cube5.position.set(-8.0, 0.5, -12.0);
    scene.add(cube5);

    var cube6 = new THREE.Mesh(cubeGeometry, material);
    cube6.position.set(8.0, 0.5, 12.0);
    scene.add(cube6);

    var cube7 = new THREE.Mesh(cubeGeometry, material);
    cube7.position.set(22.0, 0.5, 15.0);
    scene.add(cube7);

    var cube8 = new THREE.Mesh(cubeGeometry, material);
    cube8.position.set(-22.0, 0.5, -4.0);
    scene.add(cube8);

    var cube9 = new THREE.Mesh(cubeGeometry, material);
    cube9.position.set(-15.0, 0.5, -23.0);
    scene.add(cube9);

    var cube10 = new THREE.Mesh(cubeGeometry, material);
    cube10.position.set(23.0, 0.5, 18.0);
    scene.add(cube10);

    var cube11 = new THREE.Mesh(cubeGeometry, material);
    cube11.position.set(16.0, 0.5, 16.0);
    scene.add(cube11);

    var cube12 = new THREE.Mesh(cubeGeometry, material);
    cube12.position.set(-16.0, 0.5, 19.0);
    scene.add(cube12);

    var cube13 = new THREE.Mesh(cubeGeometry, material);
    cube13.position.set(17.0, 0.5, -19.0);
    scene.add(cube13);

    var cube14 = new THREE.Mesh(cubeGeometry, material);
    cube14.position.set(20.0, 0.5, -19.0);
    scene.add(cube14);

    var cube15 = new THREE.Mesh(cubeGeometry, material);
    cube15.position.set(-20.0, 0.5, 19.0);
    scene.add(cube15);

    var cube16 = new THREE.Mesh(cubeGeometry, material);
    cube16.position.set(0.0, 0.5, 6.0);
    scene.add(cube16);

    var cube16 = new THREE.Mesh(cubeGeometry, material);
    cube16.position.set(-9.0, 0.5, 6.0);
    scene.add(cube16);

    var cube17 = new THREE.Mesh(cubeGeometry, material);
    cube17.position.set(13.0, 0.5, 7.0);
    scene.add(cube17);

    var cube18 = new THREE.Mesh(cubeGeometry, material);
    cube18.position.set(-14.0, 0.5, -22.0);
    scene.add(cube18);

    var cube19 = new THREE.Mesh(cubeGeometry, material);
    cube19.position.set(21.0, 0.5, 0.0);
    scene.add(cube19);

    var cube20 = new THREE.Mesh(cubeGeometry, material);
    cube20.position.set(0.0, 0.5, 19.0);
    scene.add(cube20);

    var cube21 = new THREE.Mesh(cubeGeometry, material);
    cube21.position.set(-5.0, 0.5, -9.0);
    scene.add(cube21);


}

function render() {
    keyboardUpdate();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera) // Render scene
}
