import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import {
  initRenderer,
  createGroundPlaneXZ,
  setDefaultMaterial,
  onWindowResize,
  initCamera,
  initDefaultBasicLight,
} from "../libs/util/util.js";
import { keyboardOn, getPortalsObj } from "./utils/utils.js";
import { CSG } from "../libs/other/CSGMesh.js";

let scene, renderer, camera, keyboard, material, clock;
scene = new THREE.Scene(); // Create main scene
clock = new THREE.Clock();

renderer = initRenderer(); // View function in util/utils
initDefaultBasicLight(scene);
material = setDefaultMaterial("#8B4513"); // Create a basic material
const cubeMaterial = setDefaultMaterial("#C8996C");
camera = initCamera(new THREE.Vector3(0, 20, 20)); // Init camera in this position

var mixer = new Array();
var direction = 270; // Variavel para gravar a posição para onde o boneco aponta são 8 posições de 0 a 7
var new_direction = 270; // futura nova direção

window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
keyboard = new KeyboardState();

// Cria plano
const planeMaxSize = 40;
let initialPlane = createGroundPlaneXZ(60, 60, 1, 1, "#DBB691");

scene.add(initialPlane);

// Criando o chão
var floorCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var auxFloorCubeGeometry = new THREE.BoxGeometry(0.9, 1, 0.9);
let materialFloorCube = setDefaultMaterial("#CFB48F");
let materialAuxFloorCube = setDefaultMaterial("#EFDAB4");

var tiles = planeMaxSize / 2;
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

// Portais
let portals = getPortalsObj(planeBorderWidth);

// Criando os cubos colidíveis na borda do plano e adicionando-os à lista de colisões
// let cubesRemoved = 0;
// for (let i = -planeBorderWidth; i <= planeBorderWidth; i += cubeSize) {
//   for (let j = -planeBorderWidth; j <= planeBorderWidth; j += cubeSize) {
//     if (Math.abs(i) !== planeBorderWidth && Math.abs(j) !== planeBorderWidth)
//       continue;
//     // create a hole the size of three cubes in the middle of the border on each side
//     if (
//       (Math.abs(i) === planeBorderWidth &&
//         Math.abs(j) < cubeSize * 3 &&
//         cubesRemoved < 6) ||
//       (Math.abs(j) === planeBorderWidth &&
//         Math.abs(i) < cubeSize * 3 &&
//         cubesRemoved < 12)
//     ) {
//       cubesRemoved += 1;
//       continue;
//     }
//     const clonedMaterial = cubeMaterial.clone();
//     const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
//     borderCube.position.set(i, cubeSize / 2, j);
//     const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
//     collidableCubes.push(borderCube);
//     collidableMeshList.push(borderCubeBB);
//     scene.add(borderCube);
//   }
// }

function updateObject(mesh) {
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
}

const createPortal = (color) => {
  const portal = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 2));
  portal.position.set(0, 3, 0);
  updateObject(portal);

  // remove o retangulo da porta
  const portalRect = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2));
  portalRect.position.set(0, 1.5, 0);
  updateObject(portalRect);
  const portalCSG = CSG.fromMesh(portal);
  const portalRectCSG = CSG.fromMesh(portalRect);
  const portalCSGSub = portalCSG.subtract(portalRectCSG);
  const portalSub = CSG.toMesh(portalCSGSub, portal.matrix);
  portalSub.position.set(0, 3, 0);

  // remove a parte arredondada da porta
  const cylinderMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 2, 20)
  );
  cylinderMesh.rotateX(Math.PI / 2);
  cylinderMesh.position.set(0, 3, 0);
  updateObject(cylinderMesh);
  const portalCSGSub2 = CSG.fromMesh(portalSub).subtract(
    CSG.fromMesh(cylinderMesh)
  );

  // adiciona caracteristicas do portal
  const portalSub2 = CSG.toMesh(portalCSGSub2, portal.matrix);
  portalSub2.material = new THREE.MeshBasicMaterial({ color: "#000" });
  portalSub2.position.set(
    portals[color].position.x,
    portals[color].position.y,
    portals[color].position.z
  );
  if (portals[color].withRotation) {
    portalSub2.rotateY(Math.PI / 2);
  }

  // caso o portal não seja o inicial, adiciona esfera no topo identificando pela cor
  if (color !== "default") {
    const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20));
    sphereMesh.position.set(
      portals[color].topSpherePosition.x,
      portals[color].topSpherePosition.y,
      portals[color].topSpherePosition.z
    );
    sphereMesh.material = new THREE.MeshBasicMaterial({
      color: portals[color].color,
    });
    scene.add(sphereMesh);
  }

  scene.add(portalSub2);

  if (color === "default") return;

  // adiciona a porta caso não seja o portal inicial
  const door = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2));
  door.position.set(0, 1.5, 0);
  updateObject(door);

  // adiciona parte arredondada da porta
  const cylinderMesh2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 2, 20)
  );
  cylinderMesh2.rotateX(Math.PI / 2);
  cylinderMesh2.position.set(0, 3, 0);
  updateObject(cylinderMesh2);
  const doorCSG = CSG.fromMesh(door);
  const cylinderCSG = CSG.fromMesh(cylinderMesh2);
  const doorCSGUnion = doorCSG.union(cylinderCSG);
  const doorUnion = CSG.toMesh(doorCSGUnion, door.matrix);
  doorUnion.material = new THREE.MeshBasicMaterial({ color: "lightgreen" });
  doorUnion.position.set(
    portals[color].doorPosition.x,
    portals[color].doorPosition.y,
    portals[color].doorPosition.z
  );
  if (portals[color].withRotation) {
    doorUnion.rotateY(Math.PI / 2);
  }
  scene.add(doorUnion);

  // adiciona bounding boxes
  const doorBB = new THREE.Box3().setFromObject(doorUnion);
  collidableMeshList.push(portals[color].portalBB1);
  collidableMeshList.push(portals[color].portalBB2);
  collidableMeshList.push(doorBB);

  // atualiza o objeto de portais
  portals[color] = {
    door: doorUnion,
    doorBB,
  };
};

// Cria portais
Object.keys(portals).forEach((color) => {
  createPortal(color);
});

const openDoor = (color) => {
  const door = portals[color].door;
  // set position to open with lerping
  const openPosition = door.position.clone();
  openPosition.y = -5;
  const animateDoorOpening = () => {
    door.position.lerp(openPosition, 0.0005);
    // if door is open, remove BB
    if (door.position.y < -4) {
      const doorBB = portals[color].doorBB;
      doorBB.translate(new THREE.Vector3(0, -10, 0));
    }
    if (door.position.distanceTo(openPosition) > 0.1) {
      requestAnimationFrame(animateDoorOpening);
    }
  };
  animateDoorOpening();
};

const checkDistanceBetweenManAndDoors = () => {
  if (!manBB) return;
  Object.keys(portals).forEach((color) => {
    if (color === "default") return;
    const doorPos = portals[color].door.position.clone();

    // check if man is close to door
    const radiusDistance = 6;
    const distance = manBB.distanceToPoint(doorPos);
    if (distance < radiusDistance) {
      openDoor(color);
    }
  });
};

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

let holder = new THREE.Object3D(); // Objeto criado para manter sempre a camera e o personagem alinhados
scene.add(holder);

holder.add(camera);

// Definições do personagem
let manholder = new THREE.Object3D(); // Objeto de auxilio para manejamento do personagem

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

//insertCubes(cubeMaterial, collidableCubes, collidableMeshList, scene);
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

// rotaciona o personagem
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

  if (keyboard.down("C")) {
    changeProjection();
  }

  if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //1
    new_direction = 90;
    checkMovement("z", -normalDistance);
  } else if (
    (keyboard.pressed("W") || keyboard.pressed("up")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //7
    new_direction = 180;
    checkMovement("x", -normalDistance);
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("D") || keyboard.pressed("right"))
  ) {
    //3
    new_direction = 0;
    checkMovement("x", normalDistance);
  } else if (
    (keyboard.pressed("S") || keyboard.pressed("down")) &&
    (keyboard.pressed("A") || keyboard.pressed("left"))
  ) {
    //5
    new_direction = 270;
    checkMovement("z", normalDistance);
  } else if (keyboard.pressed("W") || keyboard.pressed("up")) {
    //0
    new_direction = 135;
    // Dividido por direções para que o personagem deslize caso apenas uma das direções esteja bloqueada
    // Eixo X
    checkMovement("x", -diagonalDistance);
    // Eixo Z
    checkMovement("z", -diagonalDistance);
  } else if (keyboard.pressed("S") || keyboard.pressed("down")) {
    //4
    new_direction = 315;
    checkMovement("x", diagonalDistance);
    checkMovement("z", diagonalDistance);
  } else if (keyboard.pressed("D") || keyboard.pressed("right")) {
    //2
    new_direction = 45;
    checkMovement("x", diagonalDistance);
    checkMovement("z", -diagonalDistance);
  } else if (keyboard.pressed("A") || keyboard.pressed("left")) {
    //6
    new_direction = 225;
    checkMovement("x", -diagonalDistance);
    checkMovement("z", diagonalDistance);
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
  checkDistanceBetweenManAndDoors();

  requestAnimationFrame(render);

  renderer.render(scene, camera);

  rotate();

  keyboardUpdate();

  if (keyboardOn(keyboard)) {
    for (var i = 0; i < mixer.length; i++) mixer[i].update(delta * 2);
  }
}
