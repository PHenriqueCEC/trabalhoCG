import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import {
  initRenderer,
  setDefaultMaterial,
  onWindowResize,
  initCamera,
  initDefaultBasicLight,
} from "../libs/util/util.js";
import {
  keyboardOn,
  getPortalsObj,
  keys,
  characterCollectedKeys,
  portalOffsetSize,
  getStairsPositionByColor,
  insertCubesFirstArea,
  insertCubesSecondArea,
  updateBB,
  whatTile,
  insertCubesThirdArea,
  positionSpotlightsThirdArea,
} from "./utils/utils.js";
import { CSG } from "../libs/other/CSGMesh.js";
import { AmbientLight, SpotLight, Vector3 } from "../build/three.module.js";
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
//import nipplejs from 'nipplejs';

const slerpConfig = {
  destination: null,
  alpha: 0.1,
  move: false,
  quaternion: null,
  object: null,
};
const holdB = {
  // usar essa estrutura para montar a projeção de onde o bloco vai cair

  hold: false,
  block: null,
};
const lerpConfig = {
  destination: null,
  alpha: 0.1,
  move: false,
  object: null,
};

const lerpConfigA2 = {
  destination: null,
  alpha: 0.1,
  move: false,
  object: null,
};

const area1Mec = {
  x: null,
  z: null,
  box: null,
  bbox: null,
};

let scene, renderer, camera, keyboard, material, clock;
scene = new THREE.Scene(); // Create main scene
clock = new THREE.Clock();

const bridge = [];

renderer = initRenderer(); // View function in util/utils
// initDefaultBasicLight(scene);
let ambient = new THREE.AmbientLight();
ambient.intensity = 0.04;
scene.add(ambient);
// renderer.shadowMap.type = THREE.VSMShadowMap;
let lightColor = "rgb(255,255, 255)";
//var dirLightIntensity = 1
let dirLight = new THREE.DirectionalLight(lightColor, 1);
dirLight.position.copy(new THREE.Vector3(5, 20, 20));
// Shadow settings
dirLight.castShadow = true;
// dirLight.shadow.camera.far = 4000;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
dirLight.name = "Direction Light";

dirLight.visible = true;

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
/* let initialPlane = createGroundPlaneXZ(30, 30, 1, 1, "#DBB691");

scene.add(initialPlane); */

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
    floorCube.receiveShadow = true;

    scene.add(floorCube);

    auxFloorCube.receiveShadow = true;

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
  }
}

// Cria cubos
const cubeSize = 2;
var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const planeBorderWidth = planeMaxSize / 2 - cubeSize / 2; // Verificando o tamanho da borda do plano

const collidableMeshList = []; // Lista de BoundingBoxes que podem colidir(usado para detectar colisões)
// const collidableCubes = []; // Cubos colidíveis(usado para detectar cliques)

const collidableCubes = new Map(); // Cubos colidíveis(usado para detectar cliques)
const collidableCubesBB = new Map();
// Portais
let portals = getPortalsObj(planeBorderWidth, planeMaxSize);

// const collidableMeshList = []; // Lista de BoundingBoxes que podem colidir(usado para detectar colisões)
// Criando os cubos colidíveis na borda do plano e adicionando-os à lista de colisões
for (let i = -planeBorderWidth; i <= planeBorderWidth; i += cubeSize) {
  for (let j = -planeBorderWidth; j <= planeBorderWidth; j += cubeSize) {
    if (Math.abs(i) !== planeBorderWidth && Math.abs(j) !== planeBorderWidth)
      continue;
    // se cubo interceptar algum portal, não adicionar à lista de colisões
    let interceptsPortal = false;
    Object.keys(portals).forEach((color) => {
      const portal = portals[color];
      const minX = portal.position.x - portalOffsetSize;
      const maxX = portal.position.x + portalOffsetSize;
      const minZ = portal.position.z - portalOffsetSize;
      const maxZ = portal.position.z + portalOffsetSize;
      if (i >= minX && i <= maxX && j >= minZ && j <= maxZ) {
        interceptsPortal = true;
      }
    });
    if (interceptsPortal) continue;
    const clonedMaterial = cubeMaterial.clone();
    const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
    borderCube.position.set(i, cubeSize / 2, j);
    borderCube.castShadow = true;
    borderCube.receiveShadow = true;
    const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
    collidableCubesBB.set(borderCube, borderCubeBB);
    // collidableCubes.push(borderCube);
    // collidableMeshList.push(borderCubeBB);
    scene.add(borderCube);
  }
}

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
  portalSub2.material = cubeMaterial.clone();
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
    sphereMesh.material = new THREE.MeshPhongMaterial({
      color: portals[color].color,
    });
    scene.add(sphereMesh);
  }

  scene.add(portalSub2);
  collidableMeshList.push(portals[color].portalBB1);
  collidableMeshList.push(portals[color].portalBB2);
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
  doorUnion.material = material.clone();
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
  collidableMeshList.push(doorBB);

  // atualiza o objeto de portais
  portals[color] = {
    door: doorUnion,
    doorBB,
  };
};
const stairsPositionByColor = getStairsPositionByColor(planeBorderWidth);
const createStairs = ({ numberOfSteps, direction, rotation, portalColor }) => {
  const rails = [];
  const stairs = new THREE.Group();
  const aux = direction === "up" ? 1 : -1;
  const stepGeometry = new THREE.BoxGeometry(1, 0.5, 5);
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const stepMaterial = new THREE.MeshPhongMaterial({ color: "brown" });
  for (let i = 0; i < numberOfSteps; i++) {
    const step = new THREE.Mesh(stepGeometry, stepMaterial);
    step.position.set(i * aux, i * 0.5 * aux, 0);
    // add limit box to stairs
    const stepLimitLeftBox = new THREE.Mesh(boxGeometry, stepMaterial);
    stepLimitLeftBox.position.set(i * aux, i * 0.5 * aux + 0.5, 2.5);
    updateObject(stepLimitLeftBox);
    const stepLimitRightBox = new THREE.Mesh(boxGeometry, stepMaterial);
    stepLimitRightBox.position.set(i * aux, i * 0.5 * aux + 0.5, -2.5);
    updateObject(stepLimitRightBox);
    rails.push(stepLimitLeftBox);
    rails.push(stepLimitRightBox);
    step.castShadow = true;
    step.receiveShadow = true;
    stairs.add(step);
    stepLimitLeftBox.castShadow = true;
    stepLimitLeftBox.receiveShadow = true;
    stairs.add(stepLimitLeftBox);
    stepLimitRightBox.castShadow = true;
    stepLimitRightBox.receiveShadow = true;
    stairs.add(stepLimitRightBox);
  }
  const pos = stairsPositionByColor[portalColor];
  if (portalColor === "blue" || portalColor === "default") {
    stairs.position.set(pos.x + 1 * aux, pos.y, pos.z);
  } else {
    stairs.position.set(pos.x, pos.y, pos.z + 1 * aux);
  }
  if (rotation) {
    stairs.rotateY(rotation);
  }
  // update rails bounding box based on rails world position
  rails.forEach((rail) => {
    rail.updateMatrixWorld();
    const worldCoords = new THREE.Vector3();
    rail.getWorldPosition(worldCoords);
    const railBB = new THREE.Box3().setFromObject(rail);

    collidableMeshList.push(railBB);
  });

  scene.add(stairs);
};

createStairs({
  numberOfSteps: 10,
  direction: "down",
  rotation: Math.PI,
  portalColor: "default",
});
createStairs({
  numberOfSteps: 10,
  direction: "up",
  rotation: Math.PI,
  portalColor: "blue",
});
createStairs({
  numberOfSteps: 10,
  direction: "down",
  rotation: Math.PI / 2,
  portalColor: "red",
});
createStairs({
  numberOfSteps: 10,
  direction: "up",
  rotation: Math.PI / 2,
  portalColor: "yellow",
});

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
      doorSound.play();
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
    if (distance < radiusDistance && characterCollectedKeys[color]) {
      openDoor(color);
    }
  });
};

const checkDistanceBetweenManAndInterruptors = () => {
  if (!manBB) return;
  interruptors.forEach(({ interruptorCube, spotLight }) => {
    const interruptorPos = interruptorCube.position.clone();
    const radiusDistance = 3;
    const distance = manBB.distanceToPoint(interruptorPos);
    if (distance < radiusDistance) {
      spotLight.intensity = 0.3;
    } else {
      spotLight.intensity = 0;
    }
  });
};
//Cria primeira area
for (let x = -tiles; x <= tiles - 1; x += 1) {
  for (let z = -tiles; z <= tiles - 1; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );
    floorCube.receiveShadow = true;
    auxFloorCube.receiveShadow = true;

    floorCube.position.set(x + 1, -5.0, z);
    floorCube.translateX(50);

    scene.add(floorCube);
    floorCube.add(auxFloorCube);

    auxFloorCube.translateY(0.01);
    if (Math.abs(x) === planeBorderWidth || Math.abs(z) === planeBorderWidth) {
      // if it is stair position, do not add wall
      if (Math.abs(z) >= 0 && Math.abs(z) <= 4 && z !== -3) continue;
      // add cube above floor
      const clonedMaterial = cubeMaterial.clone();
      const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
      borderCube.position.set(x + 0.5, -3.5, z);
      borderCube.translateX(50);
      borderCube.castShadow = true;
      borderCube.receiveShadow = true;
      // borderCubeBB
      const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
      collidableMeshList.push(borderCubeBB);
      scene.add(borderCube);
    }
  }
}

insertCubesFirstArea(cubeMaterial, collidableCubes, scene);

// ponte
const x = 71,
  z = 0;
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 2; j++) {
    const cubeGeometryMecs = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterialRangeMecs = setDefaultMaterial();
    const cubeRangeMecs = new THREE.Mesh(
      cubeGeometryMecs,
      cubeMaterialRangeMecs
    );
    cubeRangeMecs.position.set(x + i, -4.5, z + j);
    const cubeBBMecs = new THREE.Box3().setFromObject(cubeRangeMecs);
    collidableCubes.set(cubeRangeMecs, cubeBBMecs);
    area1Mec.x = cubeRangeMecs.position.x;
    area1Mec.z = cubeRangeMecs.position.z;
    area1Mec.box = cubeRangeMecs;
    area1Mec.bbox = cubeBBMecs;
    bridge.push(cubeRangeMecs);
    // scene.add(cubeBBMecs);
  }
}
// cercando a ponte
for (let i = -1.5; i < 3; i += 2) {
  const clonedMaterial = cubeMaterial.clone();
  const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
  borderCube.position.set(x + i, -3.5, z - 3);
  // borderCubeBB
  borderCube.castShadow = true;
  borderCube.receiveShadow = true;
  const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
  collidableMeshList.push(borderCubeBB);
  scene.add(borderCube);

  const borderCube2 = new THREE.Mesh(cubeGeometry, clonedMaterial);
  borderCube2.position.set(x + i, -3.5, z + 4)
  borderCube2.castShadow = true;
  borderCube2.receiveShadow = true;
  const borderCubeBB2 = new THREE.Box3().setFromObject(borderCube2);
  collidableMeshList.push(borderCubeBB2);
  scene.add(borderCube2);
  // z - 1
  // z + 2

}

//Chave azul
let roomKey = tiles / 4;
for (let x = -roomKey; x <= roomKey; x += 1) {
  for (let z = -roomKey; z <= roomKey; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x, -5.0, z);
    floorCube.translateX(79);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);


    if (Math.abs(z) === roomKey || Math.abs(x) === roomKey) {
      if (Math.abs(z) >= 0 && Math.abs(z) <= 4 && x <= 0 && z >= -2) continue;
      const clonedMaterial = cubeMaterial.clone();
      const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
      borderCube.position.set(x + 0.5, -3.5, z);
      borderCube.translateX(79);
      borderCube.castShadow = true;
      borderCube.receiveShadow = true;
      const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
      collidableMeshList.push(borderCubeBB);
      scene.add(borderCube);
    }
  }
}

//Cria segunda area
for (let x = -tiles; x <= tiles; x += 1) {
  for (let z = -tiles; z <= tiles; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x - 1, 4, z - 0.5);
    floorCube.translateX(-50);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
    if (Math.abs(x) === planeBorderWidth || Math.abs(z) === planeBorderWidth) {
      // if it is stair position, do not add wall
      if (Math.abs(z) >= 0 && Math.abs(z) <= 4 && z !== -3) continue;
      // add cube above floor
      const clonedMaterial = cubeMaterial.clone();
      const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
      borderCube.position.set(x - 0.5, 5.5, z);
      borderCube.translateX(-50);
      // borderCubeBB
      borderCube.castShadow = true;
      borderCube.receiveShadow = true;
      const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
      collidableMeshList.push(borderCubeBB);
      scene.add(borderCube);
    }
  }
}

//Chave Vermelha
for (let x = -roomKey; x <= roomKey; x += 1) {
  for (let z = -roomKey; z <= roomKey; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x, 4, z);
    floorCube.translateX(-77);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
  }
}
//porta para a chave
var doorGeometry = new THREE.BoxGeometry(1, 1, 1);
let materialDoor = setDefaultMaterial("#32b20b");
let doorA2 = new THREE.Mesh(doorGeometry, materialDoor);
doorA2.scale.set(1, 3, 10);
doorA2.position.set(-71, 6, 0);
let doorbb = new THREE.Box3().setFromObject(doorA2);
collidableCubes.set(doorA2, doorbb);
scene.add(doorA2);

insertCubesSecondArea(cubeMaterial, collidableCubes, collidableMeshList, scene);

var cubeSecondAreaGeometry = new THREE.BoxGeometry(0.9, 0.2, 0.9);
let materialCubeSecondArea = setDefaultMaterial("#D2B48C");
const floatingCube = [];
for (let z = -6; z < 5; z += 5) {
  let cubeSecondArea = new THREE.Mesh(
    cubeSecondAreaGeometry,
    materialCubeSecondArea
  );
  cubeSecondArea.position.set(-58, 5.4, z);
  floatingCube.push(cubeSecondArea);
  scene.add(cubeSecondArea);
}

//Cria terceira area
for (let x = -tiles; x <= tiles; x += 1) {
  for (let z = -tiles; z <= tiles; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x - 0.5, -5.0, z + 1);
    floorCube.translateZ(50);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
    if (Math.abs(x) === planeBorderWidth || Math.abs(z) === planeBorderWidth) {
      if (Math.abs(x) >= 0 && Math.abs(x) <= 4 && x !== -3) continue;
      const clonedMaterial = cubeMaterial.clone();
      const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
      borderCube.position.set(x, -3.5, z + 0.5);
      borderCube.translateZ(50);
      borderCube.castShadow = true;
      borderCube.receiveShadow = true;
      const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
      collidableMeshList.push(borderCubeBB);
      scene.add(borderCube);
    }
  }
}



//Cria interruptores
let interruptors = [];
var interruptorGeometry = new THREE.BoxGeometry(0.25, 1, 1);

let numInterruptor = 0;

let xT = 17.9;
let yT = -2.8;
let zT = 42;

while (numInterruptor < 8) {
  let materialInterruptor = new THREE.MeshPhongMaterial({
    color: "rgb(255, 20, 20)",
    shininess: "100",
    specular: "rgb(255, 255, 255)",
    emissive: new THREE.Color("#ffdb71"),
  });

  let interruptorCube = new THREE.Mesh(
    interruptorGeometry,
    materialInterruptor
  );

  if (numInterruptor % 2 == 0) {
    interruptorCube.translateZ(zT);
    interruptorCube.translateY(yT);
    interruptorCube.translateX(xT);
  } else {
    interruptorCube.translateZ(zT);
    interruptorCube.translateY(yT);
    interruptorCube.translateX(-xT);

    zT += 7;
  }

  scene.add(interruptorCube);

  const spotLightPos = positionSpotlightsThirdArea[numInterruptor];
  const [x, _, z] = spotLightPos;

  const spotLight = new THREE.SpotLight(0xffffff, 0);
  spotLight.position.set(x, 3, z);
  scene.add(spotLight);
  spotLight.angle = THREE.MathUtils.degToRad(25);
  spotLight.castShadow = true;

  spotLight.target.position.set(x, -3, z);
  spotLight.target.updateMatrixWorld();
  interruptors.push({ interruptorCube, spotLight });

  numInterruptor++;
}

insertCubesThirdArea(cubeMaterial, collidableCubes, scene);

//Chave Amarela
for (let x = -roomKey; x <= roomKey; x += 1) {
  for (let z = -roomKey; z <= roomKey; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x, -5.0, z);
    floorCube.translateZ(77);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);
  }
}

//Cria a area final
let finalArea = tiles / 2;
for (let x = -finalArea; x <= finalArea; x += 1) {
  for (let z = -finalArea; z <= finalArea; z += 1) {
    let floorCube = new THREE.Mesh(floorCubeGeometry, materialFloorCube);
    let auxFloorCube = new THREE.Mesh(
      auxFloorCubeGeometry,
      materialAuxFloorCube
    );

    floorCube.position.set(x, 4.0, z - 1);
    floorCube.translateZ(-40);

    floorCube.receiveShadow = true;

    auxFloorCube.receiveShadow = true;

    scene.add(floorCube);

    floorCube.add(auxFloorCube);
    auxFloorCube.translateY(0.01);

    if (Math.abs(x) === finalArea || Math.abs(z) === finalArea) {
      if (Math.abs(x) >= 0 && Math.abs(x) <= 4 && x !== -3 && z > 0) continue;
      const clonedMaterial = cubeMaterial.clone();
      const borderCube = new THREE.Mesh(cubeGeometry, clonedMaterial);
      borderCube.position.set(x + 0.5 * (x > 0 ? -1 : 1), 5.5, z - 1.5);
      borderCube.translateZ(-40);
      borderCube.castShadow = true;
      borderCube.receiveShadow = true;
      const borderCubeBB = new THREE.Box3().setFromObject(borderCube);
      collidableMeshList.push(borderCubeBB);
      scene.add(borderCube);
    }
  }
}

//Cria a plataforma sobre a area final

var platformGeometry = new THREE.BoxGeometry(10, 0.2, 10);
let materialPlatform = setDefaultMaterial("#DEB887");

let platform = new THREE.Mesh(platformGeometry, materialPlatform);

platform.position.set(0, 4.5, 0);
platform.translateZ(-40);
let finalPlatformBB = new THREE.Box3().setFromObject(platform);
// platform.translateX(-2.5);
scene.add(platform);
/* floorCube.add(auxFloorCube);
auxFloorCube.translateY(0.01); */



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
camera.position.setFromSphericalCoords(
  20,
  Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
  Math.PI / 4 // 45 degrees, between positive X and Z axes, thus on XZ-plane
);
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
  man.castShadow = true;
  man.receiveShadow = true;
  manholder.add(man);
  holder.add(dirLight);
  holder.add(dirLight.target);

  holder.add(manholder);
  manBB = new THREE.Box3().setFromObject(man);


  // Create animationMixer and push it in the array of mixers
  var mixerLocal = new THREE.AnimationMixer(man);
  mixerLocal.clipAction(gltf.animations[0]).play();
  mixer.push(mixerLocal);
});

// Cria chaves no mapa
Object.keys(keys).forEach((objKey) => {
  loader.load("./assets/keys/key.gltf", function (gltf) {
    const key = gltf.scene;
    key.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });
    key.traverse(function (node) {
      if (node.material) {
        node.material = new THREE.MeshPhongMaterial({
          color: keys[objKey].color,
        });
        node.material.side = THREE.DoubleSide;
      }
    });
    key.scale.set(0.03, 0.03, 0.03);
    key.position.set(
      keys[objKey].position.x,
      keys[objKey].position.y,
      keys[objKey].position.z
    );
    if (keys[objKey].rotate) {
      key.rotateY(Math.PI / 2);
    }
    const keyBB = new THREE.Box3().setFromObject(key);
    keys[objKey].object = key;
    keys[objKey].boundingBox = keyBB;
    scene.add(key);
  });
});

//insertCubes(cubeMaterial, collidableCubes, collidableMeshList, scene);

// insertCubes(cubeMaterial, collidableCubes, scene);

var controls = new OrbitControls(camera, renderer.domElement);

controls.keys = {
  LEFT: 'ArrowLeft', //left arrow
  UP: 'ArrowUp', // up arrow
  RIGHT: 'ArrowRight', // right arrow
  BOTTOM: 'ArrowDown' // down arrow
}


let scale = 1;
let previousScale = 0;
let size = 5;
let up = 0;
let down = 0;
let right = 0;
let left = 0;
let tempVector = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
var joystickMoviment = false;

function addJoystick() {

  // Details in the link bellow:
  // https://yoannmoi.net/nipplejs/

  let joystickL = nipplejs.create({
    zone: document.getElementById('joystickWrapper1'),
    mode: 'static',
    position: { top: '-80px', left: '80px' }
  });

  joystickL.on('move', function (evt, data) {
    const forward = data.vector.y
    const turn = data.vector.x
    up = down = left = right = 0;
    joystickMoviment = true;

    console.log("Valor turn: ", turn)
    console.log("Valor forward: ", forward) 

    if (Math.abs(forward) >= Math.abs(turn)) {
      if (forward > 0)
        up = Math.abs(forward)
      else if (forward < 0)
        down = Math.abs(forward)
    }
    else {
      if (turn > 0)
        right = Math.abs(turn)
      else if (turn < 0)
        left = Math.abs(turn)
    }
  
  })

  joystickL.on('end', function (evt) {
    down = 0
    up = 0
    left = 0
    right = 0
    joystickMoviment = false;
  })

}

addJoystick();

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
    camera.position.setFromSphericalCoords(
      20,
      Math.PI / 3, // 60 degrees from positive Y-axis and 30 degrees to XZ-plane
      Math.PI / 4 // 45 degrees, between positive X and Z axes, thus on XZ-plane
    );
  }

  camera.lookAt(camLook);
  holder.add(camera);
}

const music = new THREE.AudioListener();
camera.add(music);

const allAudios = new THREE.AudioLoader();

const backgroundSound = new THREE.Audio(music);

allAudios.load('./assets/sounds/trilha.mp3', function (buffer) {
  backgroundSound.setBuffer(buffer);
  backgroundSound.setLoop(true);
  backgroundSound.setVolume(0.2);
  //backgroundSound.play();
});

const keySound = new THREE.Audio(music)
allAudios.load('./assets/sounds/collectedKeys.mp3', function (buffer) {
  keySound.setBuffer(buffer);
  keySound.setLoop(false);
  keySound.setVolume(1);

})

const plataformaSound = new THREE.Audio(music)
allAudios.load('./assets/sounds/plataforma.wav', function (buffer) {
  plataformaSound.setBuffer(buffer);
  plataformaSound.setLoop(false);
  plataformaSound.setVolume(1);

})

const ponteSound = new THREE.Audio(music)
allAudios.load('./assets/sounds/bloco.wav', function (buffer) {
  ponteSound.setBuffer(buffer);
  ponteSound.setLoop(false);
  ponteSound.setVolume(1);

})

const doorSound = new THREE.Audio(music)
allAudios.load('./assets/sounds/porta.wav', function (buffer) {
  doorSound.setBuffer(buffer);
  doorSound.setLoop(false);
  doorSound.setVolume(1);

})


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
  for (const collidableObj of collidableCubes) {
    if (collidableObj[1] != null && manBB.intersectsBox(collidableObj[1])) {
      return true;
    }
  }
  for (const collidableObj of collidableCubesBB) {
    if (collidableObj[1] != null && manBB.intersectsBox(collidableObj[1])) {
      return true;
    }
  }
  for (const collidableObj of collidableMeshList) {
    if (manBB.intersectsBox(collidableObj)) {
      return true;
    }
  }
  return false;
}

function checkKeyCollision() {
  if (manBB === null || man === null) return;
  Object.keys(keys).forEach((color) => {
    if (manBB.intersectsBox(keys[color].boundingBox)) {
      keySound.play();
      scene.remove(keys[color].object);
      keys[color].boundingBox.translate(new THREE.Vector3(0, -10, 0));
      characterCollectedKeys[color] = true;
    }
  });
}

const getY = (posY, base) => {
  for (let i = 1; i < 11; i++) {
    if (posY < base && posY > planeBorderWidth) {
      return 0;
    }
    if (posY > base && posY < base + i) {
      return i;
    }
  }
};

function checkStairPosition() {
  let pos = parseInt(holder.position.z);

  if (pos >= 20 && pos <= 30) {
    let calculo = 19 - parseInt(holder.position.z);
    dirLight.intensity = 1 - Math.abs(calculo) * 0.09;
  }


  /* if (parseInt(holder.position.z) >= 30) {
    dirLight.intensity = 0.02
  } */
}

let oldY = 0;

function checkMovement(axis, distance) {
  const { x, y, z } = holder.position;
  const aux = distance > 0 ? -1 : 1;

  switch (axis) {
    case "x":
      manBB.translate(new THREE.Vector3(distance, 0, 0)); // Move apenas a bounding box para checar colisões
      if (checkCollision()) {
        manBB.translate(new THREE.Vector3(-distance, 0, 0)); // Move a bounding box de volta
      } else {
        holder.translateX(distance);
        if (
          Math.abs(x) >= planeBorderWidth &&
          Math.abs(x) <= planeBorderWidth + 11
        ) {
          const base = planeBorderWidth + (x > 0 ? 2.5 : 2);

          const newY = getY(Math.abs(x), base);
          if (newY !== oldY) {
            holder.translateY(aux * 0.5);
            manBB.translate(new THREE.Vector3(0, aux * 0.5, 0));
            oldY = newY;
          }
        }
      }
      break;
    case "z":
      manBB.translate(new THREE.Vector3(0, 0, distance)); // Move apenas a bounding box para checar colisões
      if (checkCollision()) {
        manBB.translate(new THREE.Vector3(0, 0, -distance)); // Move a bounding box de volta
      } else {
        holder.translateZ(distance);
        if (
          Math.abs(z) >= planeBorderWidth &&
          Math.abs(z) <= planeBorderWidth + 11
        ) {
          const base = planeBorderWidth + (z > 0 ? 2.5 : 2);

          const newY = getY(Math.abs(z), base);
          if (newY !== oldY) {
            holder.translateY(aux * 0.5);
            manBB.translate(new THREE.Vector3(0, aux * 0.5, 0));
            oldY = newY;
          }
        }

        checkStairPosition();
      }
      break;
  }
}

const diagonalDistance = 0.3; //Trocar para 0.02
const normalDistance = 0.3; //Trocar para 0.12

function keyboardUpdate() {
  keyboard.update();

  if (keyboard.down("C")) {
    changeProjection();
  }
  if (keyboard.down("T")) {
    characterCollectedKeys.blue = true;
    characterCollectedKeys.red = true;
    characterCollectedKeys.yellow = true;
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

//  To-do

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
  slerpConfig.move = false;
  lerpConfig.move = false;
  const obj = intersects[0].object;
  if (holdB.block == obj ||
    (intersects.length > 0 &&
      collidableCubes.has(obj) &&
      holder.position.distanceTo(obj.position) <= 5 &&
      holder.position.distanceTo(obj.position) > 1 &&
      !holdB.hold)
  ) {
    // Da um toggle na cor do objeto
    const currentObjColor = obj.material.color;
    let aux = obj.position;
    // aux = new Vector3(aux.x, 0.5, aux.z)

    if (
      currentObjColor.getHex() === cubeMaterial.color.getHex() &&
      holdB.hold === false
    ) {
      obj.material.color = material.color;
      let p = aux.sub(
        new Vector3(holder.position.x, holder.position.y, holder.position.z)
      );
      manholder.add(obj);
      holdB.block = obj;
      holdB.hold = true;
      obj.position.set(p.x, p.y, p.z);
      let rot = obj.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(270 - direction)
      );
      obj.rotateY(direction);
      obj.position.set(rot.x, rot.y, rot.z);

      const quaternion = new THREE.Quaternion();

      slerpConfig.move = true;
      slerpConfig.quaternion = quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(direction % 45)
      );
      slerpConfig.destination = new THREE.Vector3(0, obj.position.y + 1, 3.5);
      slerpConfig.object = obj;
      collidableCubes.set(obj, null);
    } else {
      holdB.block = null;
      holdB.hold = false;
      obj.material.color = cubeMaterial.color;
      // obj.translateY(-1);
      let p1 = null;
      let angle = direction - 270;
      aux = aux.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(angle)
      );
      let p = new Vector3(
        aux.x + holder.position.x,
        aux.y + holder.position.y,
        aux.z + holder.position.z
      );
      p1 = whatTile(p);

      manholder.remove(obj);
      const quaternion = new THREE.Quaternion();

      //mec area 2
      for (const o of floatingCube) {
        const pos = o.position;
        if (p1.x == pos.x && p1.z == pos.z) {
          p1 = new THREE.Vector3(p1.x, p1.y + 0.1, p1.z);
          plataformaSound.play();
          lerpConfigA2.destination = new THREE.Vector3(
            pos.x,
            pos.y - 0.8,
            pos.z
          );
          lerpConfigA2.move = true;
          lerpConfigA2.object = o;
          collidableCubes.delete(obj);
          const index = floatingCube.indexOf(o);
          floatingCube.splice(index, 1);
        }
      }

      //PONTE
      for (const bbridge of bridge) {
        if (p1.x == bbridge.position.x && p1.z == bbridge.position.z) {
          ponteSound.play()
          p1 = new THREE.Vector3(p1.x, p1.y - 1, p1.z);
          collidableCubes.delete(bbridge);
          collidableCubes.delete(obj);
          bridge.splice(bridge.indexOf(bbridge), 1);
        }
      }

      obj.position.set(p.x, p.y, p.z);
      obj.rotateY(angle);
      slerpConfig.move = true;
      slerpConfig.quaternion = quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(direction % 45)
      );
      slerpConfig.destination = p1;
      slerpConfig.object = obj;

      scene.add(obj);
    }
  }
}

function lerps() {
  if (slerpConfig.move) {
    slerpConfig.object.quaternion.slerp(
      slerpConfig.quaternion,
      slerpConfig.alpha
    );
    slerpConfig.object.position.lerp(
      slerpConfig.destination,
      slerpConfig.alpha
    );
  }
  if (lerpConfig.move) {
    lerpConfig.object.position.lerp(lerpConfig.destination, lerpConfig.alpha);
  }

  if (lerpConfigA2.move) {
    lerpConfigA2.object.position.lerp(
      lerpConfigA2.destination,
      lerpConfigA2.alpha
    );
  }
  if (floatingCube.length <= 0) {
    collidableCubes.delete(doorA2);
    doorA2.position.lerp(
      new THREE.Vector3(
        doorA2.position.x,
        doorA2.position.y - 5,
        doorA2.position.z,
        lerpConfig.alpha
      )
    );
  }
}


// Listener para o evento de click do mouse
document.addEventListener("mousedown", checkObjectClicked, false);

function updatePlayer() {

  const angle = controls.getAzimuthalAngle();

  if (up > 0) {
    new_direction = 135;
    checkMovement("x", -diagonalDistance);
    checkMovement("z", -diagonalDistance);

  }

   else if (down > 0) {
    new_direction = 315;
    checkMovement("x", diagonalDistance);
    checkMovement("z", diagonalDistance);
  }

  else if (right > 0) {
    console.log('Entrei aqui')
    new_direction = 45;
    checkMovement("x", diagonalDistance);
    checkMovement("z", -diagonalDistance);
  }

  else if (left > 0) {
    new_direction = 225;
    checkMovement("x", -diagonalDistance);
    checkMovement("z", diagonalDistance);

  }

}

function render() {
  updatePlayer();
  var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.
  checkDistanceBetweenManAndDoors();
  checkDistanceBetweenManAndInterruptors();
  checkKeyCollision();

  lerps();

  if (manBB && finalPlatformBB && manBB.intersectsBox(finalPlatformBB)) {
    // mensagem de alerta para fim do jogo
    alert("Fim de jogo!\n\n Parabéns, você conseguiu!");

    // reinicia o jogo
    location.reload();

    // para o loop do jogo
    cancelAnimationFrame();
  }

  requestAnimationFrame(render);
  // helper.update;
  updateBB(collidableCubes);
  renderer.render(scene, camera);
  rotate();

  keyboardUpdate();

  if (keyboardOn(keyboard) || joystickMoviment == true) {
    for (var i = 0; i < mixer.length; i++) mixer[i].update(delta * 2);
  }
}
