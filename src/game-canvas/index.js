import * as THREE from 'three';
import Stats from 'stats.js';
import TriangleGeometry from './triangle-geometry';
import pw from '../../asset/matcap-porcelain-white.jpg';
import woodTextureSource from '../../asset/floor-wood.jpg';
import mt from '../../asset/metal.jpg';
import ballTextureSource from '../../asset/ball.png';
import fontData from '../../asset/font_data.json';
import * as dat from 'dat.gui';
import gridTexture from '../../asset/env_map/grid.png';
import emptyTexture from '../../asset/env_map/empty.jpg';
import GridGeometry from './grid-geometry';
import CylinderContainerModel from '../../asset/cylinder-model.json';
import baseModel from '../../asset/base-model.json';

const gameCanvas = {};

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const COLUMN_PREFIX = "COLUMN_";


var gui = new dat.GUI({
  autoPlace: false,
  height : (32 * 3)- 1
});

var params = {
  color: 0xcdcdcd, emissive: 0xb3b3b3, y: 24, z: 27
}


var scene = new THREE.Scene();
scene.background = new THREE.Color();

var ambiColor = "#1c1c1c";
var ambientLight = new THREE.AmbientLight(ambiColor);
scene.add(ambientLight);
scene.fog = new THREE.Fog(0xffffff, 70, 140);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
var camera = new THREE.PerspectiveCamera(45, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
camera.position.set(0, 24, 27);
camera.up = new THREE.Vector3(0, 1, -1);
camera.lookAt(0, 0, 0);

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-10, 24, 24);
spotLight.shadow.camera.position.set(-10, 24, 24);
spotLight.lookAt(0, 0, 0);
spotLight.shadow.camera.lookAt(0, 0, 0);
spotLight.shadow.camera.up = new THREE.Vector3(0, -1, 0);
spotLight.castShadow = true;
// spotLight.distance = 1000;
spotLight.angle = 0.8;
spotLight.intensity = 0.45;
spotLight.penumbra = 1;
// spotLight.shadow.camera.up = new THREE.Vector3(0, 1, 0);
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 1000;
spotLight.shadow.camera.fov = 30;
scene.add(spotLight);
// var spotLightHelper = new THREE.SpotLightHelper(spotLight);
// var debugCamera = new THREE.CameraHelper(spotLight.shadow.camera);
// scene.add(debugCamera);
// scene.add(spotLightHelper);

var material = new THREE.LineBasicMaterial({ color: 0xe0e0e0 });
var line = new THREE.Line(GridGeometry(100, 2), material, THREE.LineSegments);
scene.add(line);

var cylinderMaterial = new THREE.MeshPhongMaterial({
  color: 0xcdcdcd,
  emissive: 0xb3b3b3,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false,
  blending: THREE.MultiplyBlending
});

var cylinderMaterial2 = new THREE.MeshPhongMaterial({
  color: 0xcfc898,
  emissive: 0xc0c0a6,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false,
  blending: THREE.MultiplyBlending
});

var cylinder = new THREE.ObjectLoader(new THREE.LoadingManager()).parse(CylinderContainerModel);
const CYLINDERS = [];
const GAP = 2.5;
const BALL_RADIUS = 1;
const getX = (column) => (column - 3) * GAP;
const getY = (row) => 1.3 + row * BALL_RADIUS * 2;
const INITIAL_Y = 20;

const triangle = new THREE.Mesh(TriangleGeometry(1.6, 1.2, 0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
const SIGN_Y = getY(6) + 1;
let signClock = 0;
triangle.position.y = SIGN_Y;
triangle.rotateX(Math.PI / 2);
scene.add(triangle);

for (let i = 0; i < 7; ++i) {
  let curr = cylinder.clone();
  curr.material = cylinderMaterial;
  curr.position.y = 6.6;
  curr.position.x = getX(i);
  curr.name = `${COLUMN_PREFIX}${i}`;
  CYLINDERS.push(curr);
  scene.add(curr);
}

const woodTexture = new THREE.TextureLoader().load(woodTextureSource);

var baseMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  emissive: 0x919191,
  // transparent: true,
  // opacity: 0.6,
  map: woodTexture,
});

var base = new THREE.ObjectLoader(new THREE.LoadingManager()).parse(baseModel);
base.scale.set(1.2, 1, 1.2);
base.position.x = 0.4;
base.material = baseMaterial;
scene.add(base);

const BALL_MATERIALS = [
  new THREE.MeshPhongMaterial({ color: 'red', specular: 0x5e5e5e, emissive: 0x730d0d, shininess: 15 }),
  new THREE.MeshPhongMaterial({ color: 'blue', specular: 0x5e5e5e, emissive: 0x046275, shininess: 15 })
];

const animationBalls = new Set();

const colCount = new Array(7).fill(0);

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
let activeColumn;
function onMouseMove(event) {
	mouse.x = ( event.clientX / CANVAS_WIDTH ) * 2 - 1;
  mouse.y = - ( event.clientY / CANVAS_HEIGHT ) * 2 + 1;
  // camera.position.
  // camera.position.destinationX = CAMERA_X + CAMERA_MOVE_RANGE * mouse.x;
  // camera.position.destinationY = CAMERA_Y + CAMERA_MOVE_RANGE * mouse.y;
  raycaster.setFromCamera(mouse, camera);

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects(CYLINDERS);
  // console.log(intersects);
  let nextActiveColumn = undefined;
	for ( var i = 0; i < intersects.length; i++ ) {
    // intersects[i].object.translateY(10);
    nextActiveColumn = parseInt(intersects[i].object.name.substr(COLUMN_PREFIX.length));
    intersects[i].object.material = cylinderMaterial2;
  }
  if (activeColumn != undefined && nextActiveColumn != activeColumn) {
    CYLINDERS[activeColumn].material = cylinderMaterial;
  }
  activeColumn = nextActiveColumn;
}

let turn = 0;
function onMouseClick(event) {
  if (activeColumn != undefined) {
    gameCanvas.onClickColumnEvent(activeColumn);
  }
}

function renderLoop() {
  for (let ball of animationBalls) {
    if (Math.abs(ball.position.y - ball.position.destinationY) < 0.01) {
      ball.position.y = ball.position.destinationY;
      delete ball.position.destinationY;
      animationBalls.delete(ball);
    } else {
      ball.position.y += (ball.position.destinationY - ball.position.y) * 0.13;
    }
  }

  signClock += 0.2;
  triangle.position.y = SIGN_Y + Math.sin(signClock) * 0.15;

  requestAnimationFrame(renderLoop);
  renderer.render(scene, camera);
}

function render(dom) {
  document.getElementById(dom).appendChild(renderer.domElement);
  // document.getElementById('gui').appendChild(gui.domElement);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  renderLoop();
}

const allBalls = [];

gameCanvas.add = (row, col, turn) => {
  var geometry = new THREE.SphereGeometry(1, 20, 20);

  var ball = new THREE.Mesh(geometry, BALL_MATERIALS[turn]);
  ball.position.destinationY = getY(row);
  ball.position.y = INITIAL_Y;
  ball.position.x = getX(col);
  scene.add(ball);
  allBalls.push(ball);
  animationBalls.add(ball);
};

gameCanvas.clear = () => {
  while (allBalls.length != 0) {
    scene.remove(allBalls.pop());
  }
};

gameCanvas.render = render;

gameCanvas.onClickColumnEvent = () => {};

export default gameCanvas;