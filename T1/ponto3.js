import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

let scene, renderer, camera, material, material2, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
material2 = setDefaultMaterial("green"); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// To be used to manage keyboard
let clock = new THREE.Clock();

// Show text information onscreen
showInformation();

// To use the keyboard
var keyboard = new KeyboardState();

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
const planeMaxSize = 40;
let plane = createGroundPlaneXZ(planeMaxSize, planeMaxSize);
scene.add(plane);

// create a cube
const cubeSize = 4;
var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
var cube1 = new THREE.Mesh(cubeGeometry, material);
let cube1CurrentPosition = new THREE.Vector3();
cube1CurrentPosition.copy(cube1.position);

// BB
// position the cube
const planeBorderWidth = 40 / 2;
cube1.position.set(3.0, 2.0, 0.0);
const cube1BB = new THREE.Box3().setFromObject(cube1);

let collidableMeshList = [];

for (let i = -planeBorderWidth; i < planeBorderWidth + 1; i += cubeSize) {
  for (let j = -planeBorderWidth; j < planeBorderWidth + 1; j += cubeSize) {
    if (Math.abs(i) !== planeBorderWidth && Math.abs(j) !== planeBorderWidth)
      continue;
    const borderCube = new THREE.Mesh(cubeGeometry, material2);
    borderCube.position.set(i, 2.0, j);
    const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
    collidableMeshList.push(borderCubeBB);
    scene.add(borderCube);
  }
}
// add the cube to the scene
scene.add(cube1);

render();

function keyboardUpdate() {
  keyboard.update();
  cube1CurrentPosition.copy(cube1.position);
  var speed = 30;
  var moveDistance = speed * clock.getDelta();

  // Keyboard.pressed - execute while is pressed
  if (keyboard.pressed("A") || keyboard.pressed("left"))
    cube1.translateX(-moveDistance);
  if (keyboard.pressed("D") || keyboard.pressed("right"))
    cube1.translateX(moveDistance);
  if (keyboard.pressed("W") || keyboard.pressed("up"))
    cube1.translateZ(-moveDistance);
  if (keyboard.pressed("S") || keyboard.pressed("down"))
    cube1.translateZ(moveDistance);

  if (keyboard.pressed("space")) cube1.position.set(0.0, 2.0, 0.0);
}

function checkCollision() {
  for (const collidableObj of collidableMeshList) {
    if (cube1BB.intersectsBox(collidableObj)) {
      cube1.position.copy(cube1CurrentPosition);
    } else {
      material2.color.set("green");
    }
  }
}

function showInformation() {
  // Use this to show information onscreen
  var controls = new InfoBox();
  controls.add("Keyboard Example");
  controls.addParagraph();
  controls.add("Press WASD keys to move continuously");
  controls.add("Press arrow keys to move in discrete steps");
  controls.add("Press SPACE to put the cube in its original position");
  controls.show();
}

function render() {
  cube1BB.copy(cube1.geometry.boundingBox).applyMatrix4(cube1.matrixWorld); // Update BB to current Cube position
  checkCollision(); // Check for collisions
  requestAnimationFrame(render); // Show events
  keyboardUpdate();
  renderer.render(scene, camera); // Render scene
}
