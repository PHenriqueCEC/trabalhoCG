import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  getMaxSize,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";

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

const planeBorderWidth = planeMaxSize / 2 - cubeSize / 2; // Verificando o tamanho da borda do plano

const collidableMeshList = []; // Lista de BoundingBoxes que podem colidir(usado para detectar colisões)
const collidableCubes = []; // Cubos colidíveis(usado para detectar cliques)

// Criando os cubos colidíveis na borda do plano e adicionando-os à lista de colisões
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

// Carrega o modelo GLTF e seta sua bounding box
let man = null;
let manBB = null;
function loadGLTFFile(modelName) {
  var loader = new GLTFLoader();
  loader.load(
    modelName,
    function (gltf) {
      var obj = gltf.scene;
      obj.traverse(function (child) {
        if (child) {
          child.castShadow = true;
        }
      });
      obj.traverse(function (node) {
        if (node.material) node.material.side = THREE.DoubleSide;
      });
      obj = normalizeAndRescale(obj, 8);
      man = obj;
      manBB = new THREE.Box3().setFromObject(man);
      scene.add(obj);
    },
    onProgress,
    onError
  );
}

function onError() {}

function onProgress(xhr, model) {
  if (xhr.lengthComputable) {
    var percentComplete = (xhr.loaded / xhr.total) * 100;
  }
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale) {
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(
    newScale * (1.0 / scale),
    newScale * (1.0 / scale),
    newScale * (1.0 / scale)
  );
  return obj;
}

loadGLTFFile("../assets/objects/walkingMan.glb", false);

render();

function keyboardUpdate() {
  keyboard.update();
  var speed = 30;
  var moveDistance = speed * clock.getDelta();
  // Keyboard.pressed - execute while is pressed
  if (keyboard.pressed("A") || keyboard.pressed("left")) {
    manBB.translate(new THREE.Vector3(-moveDistance, 0, 0)); // Move apenas a bounding box para checar colisões
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(moveDistance, 0, 0)); // Move a bounding box de volta
    } else {
      man.translateX(-moveDistance); // Move o objeto
    }
  }
  if (keyboard.pressed("D") || keyboard.pressed("right")) {
    manBB.translate(new THREE.Vector3(moveDistance, 0, 0));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(-moveDistance, 0, 0));
    } else {
      man.translateX(moveDistance);
    }
  }
  if (keyboard.pressed("W") || keyboard.pressed("up")) {
    manBB.translate(new THREE.Vector3(0, 0, moveDistance));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(0, 0, -moveDistance));
    } else {
      man.translateZ(moveDistance);
    }
  }

  if (keyboard.pressed("S") || keyboard.pressed("down")) {
    manBB.translate(new THREE.Vector3(0, 0, -moveDistance));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(0, 0, moveDistance));
    } else {
      man.translateZ(-moveDistance);
    }
  }
}

// Checa se a bounding box do personagem colidiu com alguma das bounding boxes dos cubos
function checkCollision() {
  if (manBB === null || man === null) return;
  for (const collidableObj of collidableMeshList) {
    if (manBB.intersectsBox(collidableObj)) {
      return true;
    }
  }
  return false;
}

// Checa se o mouse está sobre algum dos cubos
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
      // Toggle cube color
      const currentObjColor = intersects[0].object.material.color;
      if (currentObjColor.getHex() === material2.color.getHex()) {
        intersects[0].object.material.color = material.color;
      } else {
        intersects[0].object.material.color = material2.color;
      }
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
  controls.show();
}

document.addEventListener("mousedown", checkObjectClicked, false);
function render() {
  if (man !== null && manBB !== null) {
    manBB.setFromObject(man); // Atualiza a bounding box do personagem
  }
  requestAnimationFrame(render); // Show events
  keyboardUpdate();
  renderer.render(scene, camera); // Render scene
}
