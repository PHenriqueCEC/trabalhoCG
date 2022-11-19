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
  [27.0, -4, 4.0]

];


  export function insertCubesFirstArea(
  cubeMaterial,
  collidableCubes,
  collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubesFirstArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    cube.position.set(positionX, positionY, positionZ);
    const cubeBB = new THREE.Box3().setFromObject(cube);
    collidableCubes.push(cube);
    collidableMeshList.push(cubeBB);
    scene.add(cube);
  }); 
}


const positionCubesSecondArea = [
  [18.0, -4, 8.0],
  [25.0, -4, 1.0],
  [24.0, -4, 5.0],
  [21.0, -4, 3.0],
  [22.0, -4, 2.0],
  [27.0, -4, 4.0]

];

export function insertCubesSecondArea(
  cubeMaterial,
  collidableCubes,
  collidableMeshList,
  scene
) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  positionCubesFirstArea.forEach(([positionX, positionY, positionZ]) => {
    const clonedMaterial = cubeMaterial.clone();
    const cube = new THREE.Mesh(cubeGeometry, clonedMaterial);

    cube.position.set(positionX, positionY, positionZ);
    const cubeBB = new THREE.Box3().setFromObject(cube);
    collidableCubes.push(cube);
    collidableMeshList.push(cubeBB);
    scene.add(cube);
  }); 
}

