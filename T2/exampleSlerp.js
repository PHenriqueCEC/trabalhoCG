import * as THREE from 'three';
import GUI from '../libs/util/dat.gui.module.js'
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
  initRenderer,
  initDefaultSpotlight,
  initCamera,
  createGroundPlane,
  onWindowResize
} from "../libs/util/util.js";


let scene = new THREE.Scene();    // Create main scene
let renderer = initRenderer();    // View function in util/utils
let light = initDefaultSpotlight(scene, new THREE.Vector3(7.0, 7.0, 7.0));
let camera = initCamera(new THREE.Vector3(3.6, 4.6, 8.2)); // Init camera in this position
let trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes 
let axesHelper = new THREE.AxesHelper(5);
axesHelper.translateY(0.1);
scene.add(axesHelper);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

let groundPlane = createGroundPlane(10, 10, 40, 40); // width, height, resolutionW, resolutionH
groundPlane.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(groundPlane);

// Create sphere
let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshPhongMaterial({ color: "red", shininess: "200" });
let sphere1 = new THREE.Mesh(geometry, material);
sphere1.castShadow = true;
sphere1.position.set(4, 0.5, 4);
scene.add(sphere1);

// let sphere2 = new THREE.Mesh(geometry, material);
// sphere2.castShadow = true;
// sphere2.position.set(0.0, 0, 0.0);
// scene.add(sphere2);
// console.log(sphere1.position.angleTo(sphere2.position))
// Variables that will be used for linear interpolation

const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const vector = new THREE.Vector3(0, 0.5, 0);

const slerpConfig1 = {
  destination: vector,
  alpha: 0.01,
  move: true
}
const aauxi = sphere1.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
console.log(aauxi)

sphere1.position.set(aauxi.x, aauxi.y, aauxi.z);
buildInterface();
render();

function buildInterface() {
  var reset = new function () {
    this.position = function () {
      sphere1.position.set(-5, 1, -2);
      sphere1.rotateX(-Math.PI / 4);

    };
  };


  let gui = new GUI();
  let folder = gui.addFolder("sLerp Options");
  folder.open();
  folder.add(slerpConfig1, "move", true)
    .name("Esfera 1");
  folder.add(reset, "position", true).name("RESET")
  //falta criar o botao de reset
}

function render() {
  trackballControls.update();

  if (slerpConfig1.move) sphere1.quaternion.slerp(quaternion, slerpConfig1.alpha);
  if (slerpConfig1.move) sphere1.position.lerp(slerpConfig1.destination, slerpConfig1.alpha);


  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}