import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import GUI from "../libs/util/dat.gui.module.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
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
const borderCubeMaterial = setDefaultMaterial("green");
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position

var mixer = new Array();
var direction = 270; //variavel para gravar a posição para onde o boneco aponta são 8 posições de 0 a 7
var new_direction = 270;

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
keyboard = new KeyboardState();

// cria plano
const planeMaxSize = 40;
var groundPlane = createGroundPlaneXZ(planeMaxSize, planeMaxSize); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

// cria cubos
const cubeSize = 2;
var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const planeBorderWidth = planeMaxSize / 2 - cubeSize / 2; // Verificando o tamanho da borda do plano

const collidableMeshList = []; // Lista de BoundingBoxes que podem colidir(usado para detectar colisões)
const collidableCubes = []; // Cubos colidíveis(usado para detectar cliques)

// Criando os cubos colidíveis na borda do plano e adicionando-os à lista de colisões
for (let i = -planeBorderWidth; i <= planeBorderWidth; i += cubeSize) {
  for (let j = -planeBorderWidth; j <= planeBorderWidth; j += cubeSize) {
    if (Math.abs(i) !== planeBorderWidth && Math.abs(j) !== planeBorderWidth)
      continue;
    const clonedMaterial = borderCubeMaterial.clone();
    const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
    borderCube.position.set(i, cubeSize / 2, j);
    const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
    collidableCubes.push(borderCube);
    collidableMeshList.push(borderCubeBB);
    scene.add(borderCube);
  }
}

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

let holder = new THREE.Object3D();
scene.add(holder);
holder.add(camera);

let manholder = new THREE.Object3D();

var man = null;
let manBB = null;
var loader = new GLTFLoader();
loader.load("../assets/objects/walkingMan.glb", function (gltf) {
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
  holder.add(manholder);
  manBB = new THREE.Box3().setFromObject(man);

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
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -s,
      window.innerWidth / s,
      window.innerHeight / s,
      window.innerHeight / -s,
      0.1, // fiz essa alteração pois estava dando erro de clipping
      s
    );
    camera.position.set(20, 20, 20); // melhor valor que encontrei para a camera
  } else {
    // PerspectiveCamera( fov, aspect, near, far)
    camera = new THREE.PerspectiveCamera(
      45, // fov
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near
      1000 // far
    );
    camera.up.copy(camUp);
    camera.position.copy(camPos);
  }

  camera.lookAt(camLook);
  holder.add(camera);
}
function buildInterface() {
  // Interface
  var controls = new (function () {
    this.viewAxes = false;
    this.onChangeProjection = function () {
      changeProjection();
    };
  })();
  // GUI interface
  var gui = new GUI();
  gui.add(controls, "onChangeProjection").name("Change Projection");
}
function rotate() {
  if (new_direction != direction) {
    let aux = direction - new_direction;
    let dir = Math.abs(aux) / aux; // variavel de rotação
    if (Math.abs(aux) < 180) {
      //vê se é o caminho mais longo
      dir = -dir; // arruma o sentido do caminho mais curto
    }
    manholder.rotateY(THREE.MathUtils.degToRad(15 * dir));
    direction = direction + 15 * dir;

    direction = direction % 360;

    if (direction === -15) direction = 345;
  }
}

const diagonalDistance = 0.07;
const normalDistance = 0.1;
function keyboardUpdate() {
  keyboard.update();

  if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //1
    new_direction = 45;
    manBB.translate(new THREE.Vector3(diagonalDistance, 0, -diagonalDistance)); // Move apenas a bounding box para checar colisões
    if (checkCollision()) {
      manBB.translate(
        new THREE.Vector3(-diagonalDistance, 0, diagonalDistance)
      ); // Move a bounding box de volta
    } else {
      holder.translateX(diagonalDistance);
      holder.translateZ(-diagonalDistance);
    }
  } else if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //7
    new_direction = 135;
    manBB.translate(new THREE.Vector3(-diagonalDistance, 0, -diagonalDistance));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(diagonalDistance, 0, diagonalDistance));
    } else {
      holder.translateX(-diagonalDistance);
      holder.translateZ(-diagonalDistance);
    }
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //3
    new_direction = 315;
    manBB.translate(new THREE.Vector3(diagonalDistance, 0, diagonalDistance));
    if (checkCollision()) {
      manBB.translate(
        new THREE.Vector3(-diagonalDistance, 0, -diagonalDistance)
      );
    } else {
      holder.translateX(diagonalDistance);
      holder.translateZ(diagonalDistance);
    }
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //5
    new_direction = 225;
    manBB.translate(new THREE.Vector3(-diagonalDistance, 0, diagonalDistance));
    if (checkCollision()) {
      manBB.translate(
        new THREE.Vector3(diagonalDistance, 0, -diagonalDistance)
      );
    } else {
      holder.translateX(-diagonalDistance);
      holder.translateZ(diagonalDistance);
    }
  } else if (keyboard.pressed("W") || keyboard.pressed("up")) {
    //0
    new_direction = 90;
    manBB.translate(new THREE.Vector3(0, 0, -normalDistance));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(0, 0, normalDistance));
    } else {
      holder.translateZ(-normalDistance);
    }
  } else if (keyboard.pressed("S") || keyboard.pressed("down")) {
    //4
    new_direction = 270;
    manBB.translate(new THREE.Vector3(0, 0, normalDistance));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(0, 0, -normalDistance));
    } else {
      holder.translateZ(+normalDistance);
    }
  } else if (keyboard.pressed("D") || keyboard.pressed("right")) {
    //2
    new_direction = 0;
    manBB.translate(new THREE.Vector3(normalDistance, 0, 0));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(-normalDistance, 0, 0));
    } else {
      holder.translateX(normalDistance);
    }
  } else if (keyboard.pressed("A") || keyboard.pressed("left")) {
    //6
    new_direction = 180;
    manBB.translate(new THREE.Vector3(-normalDistance, 0, 0));
    if (checkCollision()) {
      manBB.translate(new THREE.Vector3(normalDistance, 0, 0));
    } else {
      holder.translateX(-normalDistance);
    }
  }
}

function keyboardOn() {
  if (
    keyboard.pressed("W") ||
    keyboard.pressed("up") ||
    keyboard.pressed("S") ||
    keyboard.pressed("down") ||
    keyboard.pressed("D") ||
    keyboard.pressed("right") ||
    keyboard.pressed("A") ||
    keyboard.pressed("left")
  ) {
    return true;
  } else {
    return false;
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
      if (currentObjColor.getHex() === borderCubeMaterial.color.getHex()) {
        intersects[0].object.material.color = material.color;
      } else {
        intersects[0].object.material.color = borderCubeMaterial.color;
      }
    }
  }
}

document.addEventListener("mousedown", checkObjectClicked, false);
function render() {
  var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.

  requestAnimationFrame(render);

  renderer.render(scene, camera);

  rotate();

  keyboardUpdate();
  // Render scene

  if (keyboardOn()) {
    for (var i = 0; i < mixer.length; i++) mixer[i].update(delta * 2);
  }
}
