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
import { insertCubes, keyboardOn } from "./utils/utils.js";

let scene, renderer, light, camera, keyboard, material, clock;
scene = new THREE.Scene(); // Create main scene
clock = new THREE.Clock();

renderer = initRenderer(); // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(25.0, 95.0, 50.0)); // Use default light
material = setDefaultMaterial("#8B4513"); // Create a basic material
const cubeMaterial = setDefaultMaterial("#DEB887");
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position

var mixer = new Array();
var direction = 270; // Variavel para gravar a posição para onde o boneco aponta são 8 posições de 0 a 7
var new_direction = 270;

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
keyboard = new KeyboardState();

// Cria plano
const planeMaxSize = 118;
let plane = createGroundPlaneXZ(210, 210, 1, 1, "#FFE0B5");

scene.add(plane);

// Criando o chão
var floorCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var auxFloorCubeGeometry = new THREE.BoxGeometry(0.9, 1, 0.9);
let materialFloorCube = setDefaultMaterial("#E6DEB3");
let materialAuxFloorCube = setDefaultMaterial("#e8cea9");

var tiles = planeMaxSize / 2 - 1;
for (let x = -tiles; x <= tiles; x += 1) {
  for (let z = -tiles; z <= tiles; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x, -0.5, z);
    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
  }
}

// Cria cubos
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
    const clonedMaterial = cubeMaterial.clone();
    const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
    borderCube.position.set(i, cubeSize / 2, j);
    const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
    collidableCubes.push(borderCube);
    collidableMeshList.push(borderCubeBB);
    scene.add(borderCube);
  }
}

// Definições da câmera
let camPos = new THREE.Vector3(10.5, 10.5, 10.5);
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

// Definições do personagem
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

insertCubes(cubeMaterial, collidableCubes, collidableMeshList, scene);
buildInterface();
render();

// Funções auxiliares
function changeProjection() {
  // Store the previous position of the camera
  if (camera instanceof THREE.PerspectiveCamera) {
    var s = 142; // Estimated size for orthographic projection
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -s,
      window.innerWidth / s,
      window.innerHeight / s,
      window.innerHeight / -s,
      0.1,
      s
    );
    camera.position.set(20, 20, 20); // Melhor valor que encontrei para a camera
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
    let dir = Math.abs(aux) / aux; // Variavel de rotação
    if (Math.abs(aux) < 180) {
      // Vê se é o caminho mais longo
      dir = -dir; // Arruma o sentido do caminho mais curto
    }
    manholder.rotateY(THREE.MathUtils.degToRad(15 * dir));
    direction = direction + 15 * dir;

    direction = direction % 360;

    if (direction === -15) direction = 345;
  }
}

function checkCollision() {
  if (manBB === null || man === null) return;
  for (const collidableObj of collidableMeshList) {
    if (manBB.intersectsBox(collidableObj)) {
      return true;
    }
  }
  return false;
}

function checkMovement(axis, distance) {
  switch (axis) {
    case "x":
      manBB.translate(new THREE.Vector3(distance, 0, 0)); // Move apenas a bounding box para checar colisões
      if (checkCollision()) {
        manBB.translate(new THREE.Vector3(-distance, 0, 0)); // Move a bounding box de volta
      } else {
        holder.translateX(distance);
      }
      break;
    case "z":
      manBB.translate(new THREE.Vector3(0, 0, distance)); // Move apenas a bounding box para checar colisões
      if (checkCollision()) {
        manBB.translate(new THREE.Vector3(0, 0, -distance)); // Move a bounding box de volta
      } else {
        holder.translateZ(distance);
      }
      break;
  }
}

const diagonalDistance = 0.08;
const normalDistance = 0.12;

function keyboardUpdate() {
  keyboard.update();

  if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //1
    new_direction = 45;
    // Dividido por direções para que o personagem deslize caso apenas uma das direções esteja bloqueada
    // Eixo X
    checkMovement("x", diagonalDistance);
    // Eixo Z
    checkMovement("z", -diagonalDistance);
  } else if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //7
    new_direction = 135;
    checkMovement("x", -diagonalDistance);
    checkMovement("z", -diagonalDistance);
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //3
    new_direction = 315;
    checkMovement("x", diagonalDistance);
    checkMovement("z", diagonalDistance);
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //5
    new_direction = 225;
    checkMovement("x", -diagonalDistance);
    checkMovement("z", diagonalDistance);
  } else if (keyboard.pressed("W") || keyboard.pressed("up")) {
    //0
    new_direction = 90;
    checkMovement("z", -normalDistance);
  } else if (keyboard.pressed("S") || keyboard.pressed("down")) {
    //4
    new_direction = 270;
    checkMovement("z", normalDistance);
  } else if (keyboard.pressed("D") || keyboard.pressed("right")) {
    //2
    new_direction = 0;
    checkMovement("x", normalDistance);
  } else if (keyboard.pressed("A") || keyboard.pressed("left")) {
    //6
    new_direction = 180;
    checkMovement("x", -normalDistance);
  }
}

// Checa se o mouse está sobre algum dos cubos
function checkObjectClicked(event) {
  // Checa se o mouse foi pressionado
  // Pega a posição do mouse em coordenadas normalizadas
  // (-1 até +1) para ambos os componentes
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cria um raio que parte da posição do mouse
  //  e vai na direção da câmera
  const raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(mouse, camera);
  // Cria um array contendo todos os objetos da cena com os quais o raio intersecta
  const intersects = raycaster.intersectObjects(scene.children, true);
  // Se houver uma (ou mais) interseções
  if (intersects.length > 0) {
    // Mostra apenas o primeiro objeto
    if (collidableCubes.includes(intersects[0].object)) {
      // Da um toggle na cor do objeto
      const currentObjColor = intersects[0].object.material.color;
      if (currentObjColor.getHex() === cubeMaterial.color.getHex()) {
        intersects[0].object.material.color = material.color;
      } else {
        intersects[0].object.material.color = cubeMaterial.color;
      }
    }
  }
}

// Listener para o evento de click do mouse
document.addEventListener("mousedown", checkObjectClicked, false);

function render() {
  var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.

  requestAnimationFrame(render);

  renderer.render(scene, camera);

  rotate();

  keyboardUpdate();

  if (keyboardOn(keyboard)) {
    for (var i = 0; i < mixer.length; i++) mixer[i].update(delta * 2);
  }
}
