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
// Create a position for the cube so whe can save it in case of collision
cube1CurrentPosition.copy(cube1.position);

// position the cube
const planeBorderWidth = planeMaxSize / 2 - cubeSize / 2;
cube1.position.set(0.0, cubeSize / 2, 0.0);
// Main cube Bounding Box for collision
const cube1BB = new THREE.Box3().setFromObject(cube1);

const collidableMeshList = [];
const collidableCubes = [];

for (let i = -planeBorderWidth; i <= planeBorderWidth; i += cubeSize) {
  for (let j = -planeBorderWidth; j <= planeBorderWidth; j += cubeSize) {
    if (Math.abs(i) !== planeBorderWidth && Math.abs(j) !== planeBorderWidth)
      continue;
    const clonedMaterial = material2.clone();
    const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
    borderCube.position.set(i, 2.0, j);
    const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
    collidableCubes.push(borderCube);
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
}

function checkCollision() {
  for (const collidableObj of collidableMeshList) {
    if (cube1BB.intersectsBox(collidableObj)) {
      cube1.position.copy(cube1CurrentPosition);
    }
  }
}

function checkObjectClicked(event) {
  // Check if the mouse was pressed
  // Get the mouse position in normalized device coordinates
  // (-1 to +1) for both components
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Create a Ray with origin at the mouse position
  //   and direction into the scene (camera direction)
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  // Create an array containing all objects in the scene with which the ray intersects
  var intersects = raycaster.intersectObjects(scene.children, true);
  // If there is one (or more) intersections
  if (intersects.length > 0) {
    // Show only the first object
    if (collidableCubes.includes(intersects[0].object)) {
      // Set a random color even if pressed multiple times
      intersects[0].object.material.color.set(
        Math.random() * 0xffffff,
        Math.random() * 0xffffff,
        Math.random() * 0xffffff
      );
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

document.addEventListener("mousedown", checkObjectClicked, false);
function render() {
  cube1BB.copy(cube1.geometry.boundingBox).applyMatrix4(cube1.matrixWorld); // Update BB to current Cube position
  checkCollision(); // Check for collisions
  requestAnimationFrame(render); // Show events
  keyboardUpdate();
  renderer.render(scene, camera); // Render scene
}
