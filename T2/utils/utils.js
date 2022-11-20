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
  [18.0, -4, 8.0],
  [25.0, -4, 1.0],
  [24.0, -4, 5.0],
  [21.0, -4, 3.0],
  [22.0, -4, 2.0],
  [27.0, -4, 4.0],
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
    collidableCubes.set(cube, cubeBB);

    // collidableCubes.push(cube);
    // collidableMeshList.push(cubeBB);
    scene.add(cube);
  });
}

// Portais
export const getPortalsObj = (planeBorderWidth) => ({
  blue: {
    door: null,
    doorBB: null,
    position: new THREE.Vector3(-planeBorderWidth, 3, 1),
    doorPosition: new THREE.Vector3(-planeBorderWidth, 1.5, 1),
    topSpherePosition: new THREE.Vector3(-planeBorderWidth + 1, 6, 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-18, 0, -2),
      new THREE.Vector3(-20, 6, -1),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(-18, 0, 2.25),
      new THREE.Vector3(-20, 6, 3),
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
      new THREE.Vector3(-2, 0, -18),
      new THREE.Vector3(-1, 6, -20),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(3, 0, -18),
      new THREE.Vector3(4, 6, -20),
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
      new THREE.Vector3(-2, 0, 18),
      new THREE.Vector3(-1, 6, 20),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(3, 0, 18),
      new THREE.Vector3(4, 6, 20),
    ]),
    color: "#FF0000",
    withRotation: false,
  },
  default: {
    position: new THREE.Vector3(planeBorderWidth, 3, 1),
    portalBB1: new THREE.Box3().setFromPoints([
      new THREE.Vector3(18, 0, -2),
      new THREE.Vector3(20, 6, -1),
    ]),
    portalBB2: new THREE.Box3().setFromPoints([
      new THREE.Vector3(18, 0, 2.25),
      new THREE.Vector3(20, 6, 3),
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
    position: new THREE.Vector3(42, -5, 0),
    color: "#0000FF",
  },
  yellow: {
    object: null,
    boundingBox: null,
    position: new THREE.Vector3(0, -5, 40),
    color: "#FFFF00",
    rotate: true,
  },
  red: {
    object: null,
    boundingBox: null,
    position: new THREE.Vector3(-40, 5, 0),
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
  [-18.0, 5, 8.0],
  [-25.0, 5, 1.0],
  [-24.0, 5, 5.0],
  [-21.0, 5, 3.0],
  [-22.0, 5, 2.0],
  [-27.0, 5, 4.0],
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
    collidableCubes.set(cube, cubeBB);
    // collidableMeshList.push(cubeBB);
    scene.add(cube);
    // cube.add(cubeBB);
  });
}

export function updateBB(collidableCubes) {

  for (const obj of collidableCubes) {
    // let p = obj[0].position;

    collidableCubes.set(obj[0], new THREE.Box3().setFromObject(obj[0]))
    // obj[1].set(new THREE.Box3().setFromObject(obj[0]));
    // collidableCubes.
  }
}


export function whatTile(position) {
  // const tileSize = 1;
  const x = parseInt(position.x + 0.5);
  const z = parseInt(position.z + 0.5);
  // if (position.x % 0.5 == 0) { x = position.x; } else { x = parseInt(position.x) + 0.5; }
  // if (position.z % 0.5 == 0) { z = position.z; } else { z = parseInt(position.z) + 0.5; }
  // console.log(position, new THREE.Vector3(x, position.y - 2, z))
  return new THREE.Vector3(x, position.y - 1, z)// menos dois pra apontar pro lugar onde o bloco vai para

}


// const bridge = [];
// // func
// const area1Mec = {
//   x: null,
//   z: null,
//   box: null,
//   bbox: null,
// };
// // collidableCubes;
// const x = 1, z = 2;
// for (let i = 0; i < 3; i++) {
//   for (let j = 0; j < 2; j++) {
//     const cubeGeometryMecs = new THREE.BoxGeometry(1, 1, 1);
//     const cubeMaterialRangeMecs = setDefaultMaterial()
//     const cubeRangeMecs = new THREE.Mesh(cubeGeometryMecs, cubeMaterialRangeMecs);
//     cubeRangeMecs.translate(new THREE.Vector3(x + i, -4.5, z + j));
//     const cubeBBMecs = new THREE.Box3().setFromObject(cubeRangeMecs);
//     collidableCubes.set(cubeRangeMecs, cubeBBMecs);
//     area1Mec.x = cubeRangeMecs.position.x;
//     area1Mec.z = cubeRangeMecs.position.z;
//     area1Mec.box = cubeRangeMecs;
//     area1Mec.bbox = cubeBBMecs;
//     bridge.push(area1Mec)
//   }
// }

// for (const bbridge of bridge) {
//   if (p1.x == bbridge.box.position.x && p1.z == bbridge.box.position.z) {
//     p1 = new THREE.Vector3(p1.x, p1.y - 1, p1.z)
//     collidableCubes.delete(bbridge.box);
//     bridge.splice(bridge.indexOf(bbridge), 1);
//   }
// }