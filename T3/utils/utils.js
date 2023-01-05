import * as THREE from "three";

export function keyboardOn(keyboard) {
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

const positionCubesFirstArea = [
  [58, -4, 5.0],
  [56.0, -4, 2.0],
  [58.0, -4, 10.0],
  [52.0, -4, 6.0],
  [54.0, -4, 4.0],
  [50.0, -4, 5.0],
];

export function insertCubesFirstArea(
  cubeMaterial,
  collidableCubes,
  // collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubesFirstArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    cube.position.set(positionX, positionY, positionZ);
    const cubeBB = new THREE.Box3().setFromObject(cube);
    cube.castShadow = true;
    collidableCubes.set(cube, cubeBB);
    // collidableMeshList.push(cubeBB);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    // cube.add(cubeBB);
  });
}

// Portais
export const getPortalsObj = (planeBorderWidth, planeMaxSize) => ({
  blue: {
    door: null,
    doorBB: null,
    position: new THREE.Vector3(-planeBorderWidth, 3, 1),
    doorPosition: new THREE.Vector3(-planeBorderWidth, 1.5, 1),
    topSpherePosition: new THREE.Vector3(-planeBorderWidth + 1, 6, 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-planeMaxSize / 2 + 2, 0, -2),
      new THREE.Vector3(-planeMaxSize / 2, 6, -1),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-planeMaxSize / 2 + 2, 0, 2.25),
      new THREE.Vector3(-planeMaxSize / 2, 6, 3),
    ]),
    color: "#0000FF",
    withRotation: true,
  },
  yellow: {
    door: null,
    doorBB: null,
    position: new THREE.Vector3(1, 3, -planeBorderWidth),
    doorPosition: new THREE.Vector3(1, 1.5, -planeBorderWidth),
    topSpherePosition: new THREE.Vector3(1, 6, -planeBorderWidth + 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-2, 0, -planeMaxSize / 2 + 2),
      new THREE.Vector3(-1, 6, -planeMaxSize / 2),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(3, 0, -planeMaxSize / 2 + 2),
      new THREE.Vector3(4, 6, -planeMaxSize / 2),
    ]),
    color: "#FFFF00",
    withRotation: false,
  },
  red: {
    door: null,
    doorBB: null,
    position: new THREE.Vector3(1, 3, planeBorderWidth),
    doorPosition: new THREE.Vector3(1, 1.5, planeBorderWidth),
    topSpherePosition: new THREE.Vector3(1, 6, planeBorderWidth - 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-2, 0, planeMaxSize / 2 - 2),
      new THREE.Vector3(-1, 6, planeMaxSize / 2),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(3, 0, planeMaxSize / 2 - 2),
      new THREE.Vector3(4, 6, planeMaxSize / 2),
    ]),
    color: "#FF0000",
    withRotation: false,
  },
  default: {
    position: new THREE.Vector3(planeBorderWidth, 3, 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(planeMaxSize / 2 - 2, 0, -2),
      new THREE.Vector3(planeMaxSize / 2, 6, -1),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(planeMaxSize / 2 - 2, 0, 2.25),
      new THREE.Vector3(planeMaxSize / 2, 6, 3),
    ]),
    withRotation: true,
  },
});

export const characterCollectedKeys = {
  blue: false,
  yellow: false,
  red: false,
};

export const keys = {
  blue: {
    object: null,
    boundingBox: null,
    position: new THREE.Vector3(80, -5, 0),
    color: "#0000FF",
  },
  yellow: {
    object: null,
    boundingBox: null,
    position: new THREE.Vector3(0, -5, 76),
    color: "#FFFF00",
    rotate: true,
  },
  red: {
    object: null,
    boundingBox: null,
    position: new THREE.Vector3(-76, 4, 0),
    color: "#FF0000",
  },
};
export const portalOffsetSize = 2.5;

export const getStairsPositionByColor = (planeBorderWidth) => ({
  blue: new THREE.Vector3(-planeBorderWidth - portalOffsetSize - 0.5, -0.25, 1),
  red: new THREE.Vector3(1, -0.25, planeBorderWidth + portalOffsetSize + 0.5),
  yellow: new THREE.Vector3(
    1,
    -0.25,
    -planeBorderWidth - portalOffsetSize - 0.5
  ),
  default: new THREE.Vector3(
    planeBorderWidth + portalOffsetSize + 0.5,
    -0.25,
    1
  ),
});

const positionCubesSecondArea = [
  [-36.0, 5, 16.0],
  [-50.0, 5, 2.0],
  [-48.0, 5, 10.0],
  [-42.0, 5, 6.0],
  [-44.0, 5, 4.0],
  [-54.0, 5, 8.0],
];

export function insertCubesSecondArea(
  cubeMaterial,
  collidableCubes,
  collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubesSecondArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    cube.position.set(positionX, positionY, positionZ);
    const cubeBB = new THREE.Box3().setFromObject(cube);
    cube.castShadow = true;
    collidableCubes.set(cube, cubeBB);
    // collidableMeshList.push(cubeBB);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    // cube.add(cubeBB);
  });
}

export function insertCubes(
  cubeMaterial,
  collidableCubes,
  // collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubesFirstArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    cube.position.set(positionX, positionY, positionZ);
    const cubeBB = new THREE.Box3().setFromObject(cube);
    cube.castShadow = true;
    cube.receiveShadow = true;

    collidableCubes.set(cube, cubeBB);
    // collidableMeshList.push(cubeBB);
    scene.add(cube);
    // cube.add(cubeBB);
  });
}

export function updateBB(collidableCubes) {
  for (const obj of collidableCubes) {
    // let p = obj[0].position;

    collidableCubes.set(obj[0], new THREE.Box3().setFromObject(obj[0]));
    // obj[1].set(new THREE.Box3().setFromObject(obj[0]));
    // collidableCubes.
  }
}

export function whatTile(position) {
  // const tileSize = 1;
  const x = parseInt(position.x + 0.5);
  const z = parseInt(position.z + 0.5);
  return new THREE.Vector3(x, position.y - 1, z); // menos dois pra apontar pro lugar onde o bloco vai para
}

export const positionCubesThirdArea = [
  [13, -4, 42],
  [-13, -4, 56],
  [13, -4, 63],
  [-13, -4, 49],
  [-13, -4, 42],
  [13, -4, 56],
  [-13, -4, 63],
  [13, -4, 49],
];

export const positionSpotlightsThirdArea = [
  [13, 6, 42],
  [-13, 6, 42],
  [13, 6, 49],
  [-13, 6, 49],
  [13, 6, 56],
  [-13, 6, 56],
  [13, 6, 63],
  [-13, 6, 63],
];

export function insertCubesThirdArea(
  cubeMaterial,
  collidableCubes,
  scene,
  interruptors
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  let cont = 0;
  positionCubesThirdArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    if (cont < 2) {
      //Só entra aqui os 4 primeiros blocos da matriz
      cube.position.set(positionX, positionY, positionZ);
      const cubeBB = new THREE.Box3().setFromObject(cube);
      cube.castShadow = true;
      cube.visible = false;
      collidableCubes.set(cube, cubeBB);
      // collidableMeshList.push(cubeBB);
      interruptors.find(
        ({ spotLight }) =>
          spotLight.position.x === positionX &&
          spotLight.position.z === positionZ
      ).catchableCube = cube;
      scene.add(cube);
      // cube.add(cubeBB);
    }

    cont++;
  });
}

export function collectKey(keyColor) {
  characterCollectedKeys[keyColor] = true;
  document.getElementById(`${keyColor}-key`).style.visibility = "visible";
  const $p = document.getElementById(`${keyColor}-key-quantity`);
  $p.style.visibility = "visible";
  $p.innerHTML = "x1";
}
