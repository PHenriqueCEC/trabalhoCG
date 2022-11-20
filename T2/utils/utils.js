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

const positionCubes = [
  [6.0, 0.5, 0.0],
  [7.0, 0.5, 0.0],
  [8.0, 0.5, 0.0],
  [0.0, 0.5, -12.0],
  [-8.0, 0.5, -12.0],
  [8.0, 0.5, 12.0],
  [22.0, 0.5, 15.0],
  [-22.0, 0.5, -4.0],
  [16.0, 0.5, 16.0],
  [-16.0, 0.5, 19.0],
  [17.0, 0.5, -19.0],
  [0.0, 0.5, 6.0],
  [-9.0, 0.5, 6.0],
  [13.0, 0.5, 7.0],
  [0.0, 0.5, 19.0],
  [-5.0, 0.5, -9.0],
  [15, 0.5, 10],
  [16, 0.5, 10],
  [17, 0.5, 10],
  [18, 0.5, 10],
  [19, 0.5, 10],
  [20, 0.5, 10],
  [21, 0.5, 10],
  [22, 0.5, 10],
  [23, 0.5, 10],
  [24, 0.5, 10],
  [25, 0.5, 10],
  [26, 0.5, -1],
  [26, 0.5, 0],
  [26, 0.5, 1],
  [26, 0.5, 2],
  [26, 0.5, 3],
  [26, 0.5, 4],
  [26, 0.5, 5],
  [26, 0.5, 6],
  [26, 0.5, 7],
  [26, 0.5, 8],
  [26, 0.5, 10],
  [26, 0.5, 9],
];

export function insertCubes(
  cubeMaterial,
  collidableCubes,
  // collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubes.forEach(([positionX, positionY, positionZ]) => {
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