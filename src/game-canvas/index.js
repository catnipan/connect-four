import * as THREE from 'three';
import sound from '../../asset/sound.mp3';
import TriangleGeometry from './triangle-geometry';
import baseMatSource from '../../asset/matcap-porcelain-white.jpg';
import GridGeometry from './grid-geometry';
import CylinderContainerModel from '../../asset/cylinder-model.json';
import baseModel from '../../asset/base-model.json';
import { Material } from 'three';

const gameCanvas = {};
let myTurn = undefined;
let waitTurn = undefined;

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const COLUMN_COUNT = 7;
const ROW_COUNT = 6;
const CAMERA_Y = 20;

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
camera.position.set(0, 22, 33);
camera.position.destinationY = 20;
camera.up = new THREE.Vector3(0, 1, -1);
camera.lookAt(0, 2, 0);

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-10, 24, 24);
spotLight.shadow.camera.position.set(-10, 24, 24);
spotLight.lookAt(0, 0, 0);
spotLight.shadow.camera.lookAt(0, 0, 0);
spotLight.shadow.camera.up = new THREE.Vector3(0, -1, 0);
spotLight.castShadow = true;
// spotLight.distance = 1000;
spotLight.angle = 0.8;
spotLight.intensity = 0.75;
spotLight.penumbra = 1;
// spotLight.shadow.camera.up = new THREE.Vector3(0, 1, 0);
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 1000;
spotLight.shadow.camera.fov = 30;
scene.add(spotLight);
var spotLightHelper = new THREE.SpotLightHelper(spotLight);
var debugCamera = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(debugCamera);
scene.add(spotLightHelper);

var material = new THREE.LineBasicMaterial({ color: 0xe0e0e0 });
var line = new THREE.Line(GridGeometry(100, 2), material, THREE.LineSegments);
scene.add(line);

var cylinderMaterial = new THREE.MeshPhongMaterial({
  color: 0xc2c2c2,
  emissive: 0xadadad,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false,
  blending: THREE.MultiplyBlending
});

var cylinderMaterial2 = new THREE.MeshPhongMaterial({
  color: 0xbfb888,
  emissive: 0xb3b391,
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
const createGrid = () => new Array(COLUMN_COUNT).fill().map(() => []);
let allBalls = createGrid();

for (let c = 0; c < COLUMN_COUNT; ++c) {
  let curr = cylinder.clone();
  curr.material = cylinderMaterial;
  curr.position.y = 6.6;
  curr.position.x = getX(c);
  curr.columnIdx = c;
  CYLINDERS.push(curr);
  scene.add(curr);
}

const baseMat = new THREE.TextureLoader().load(baseMatSource);

var baseMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  emissive: 0x424242,
  map: baseMat,
});

var base = new THREE.ObjectLoader(new THREE.LoadingManager()).parse(baseModel);
base.scale.set(1.2, 1, 1.2);
base.position.x = 0.4;
base.position.y = 0.2;
base.material = baseMaterial;
base.receiveShadow = true;
scene.add(base);

const BALL_MATERIALS = [
  new THREE.MeshPhongMaterial({ color: 'red', specular: 0x525252, emissive: 0x610808, shininess: 10 }),
  new THREE.MeshPhongMaterial({ color: 'blue', specular: 0x525252, emissive: 0x055c6e, shininess: 10 }),
  new THREE.MeshPhongMaterial({ color: 0xff4d4d, specular: 0x525252, emissive: 0x610808, shininess: 10 }),
  new THREE.MeshPhongMaterial({ color: 0x6666ff, specular: 0x525252, emissive: 0x055c6e, shininess: 10 }),
];
const GRAY_MATERIAL = new THREE.MeshPhongMaterial({ color: 'gray', specular: 0x5e5e5e, emissive: 0x757575, shininess: 15 });

const ACTIVE_SIGN_Y = getY(ROW_COUNT) + 1.2;
const active = {
  column: undefined,
  sign: undefined,
  clock: 0,
}

const signGeo = TriangleGeometry(1.8, 0.5, 0.3);

function updateActiveColumn(nextColumn) {
  if (active.column == nextColumn) {
    return;
  }
  if (active.column != undefined) {
    CYLINDERS[active.column].material = cylinderMaterial;
    scene.remove(active.sign);
  }
  if (nextColumn != undefined) {
    CYLINDERS[nextColumn].material = cylinderMaterial2;
    const mat = myTurn == undefined ? GRAY_MATERIAL : BALL_MATERIALS[myTurn];
    const newSign = new THREE.Mesh(signGeo, mat);
    newSign.position.y = ACTIVE_SIGN_Y;
    newSign.position.x = getX(nextColumn);
    newSign.rotateX(Math.PI);
    scene.add(newSign);
    active.sign = newSign;
    active.clock = 0;
  }
  active.column = nextColumn;
  updateCursor();
}

function updateCursor() {
  gcEl.style.cursor = (
    active.column != undefined
    ? ((myTurn == waitTurn && myTurn != undefined) ? 'pointer' : 'not-allowed')
    : 'default'
  );
}

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
let activeColumn;
function onMouseMove(event) {
	mouse.x = ( event.clientX / CANVAS_WIDTH ) * 2 - 1;
  mouse.y = - ( event.clientY / CANVAS_HEIGHT ) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects(CYLINDERS);
  // console.log(intersects);
  let nextActiveColumn = undefined;
  if (intersects.length > 0) {
    updateActiveColumn(intersects[0].object.columnIdx);
  } else {
    updateActiveColumn(undefined);
  }
}

let turn = 0;
function onMouseClick(event) {
  if (active.column != undefined) gameCanvas.onClickColumnEvent(active.column);
}

const gcEl = document.getElementById('game-canvas');
function renderLoop() {

  if (active.column) {
    active.clock += 0.2;
    active.sign.position.y = ACTIVE_SIGN_Y + Math.sin(active.clock) * 0.15;
  }
  requestAnimationFrame(renderLoop);
  renderer.render(scene, camera);
}

function render(dom, store) {
  document.getElementById(dom).appendChild(renderer.domElement);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  store.subscribe(() => {
    const state = store.getState();
    myTurn = state.myTurn;
    waitTurn = state.waitTurn;
    updateCursor();
  });
  renderLoop();
}

let lastBall = undefined;
let lastBallResetMat = undefined;

gameCanvas.add = (row, col, turn) => {
  var geometry = new THREE.SphereGeometry(1, 20, 20);

  var ball = new THREE.Mesh(geometry, BALL_MATERIALS[turn + 2]);
  ball.position.yDestination = getY(row);
  ball.position.y = 40;
  ball.position.x = getX(col);
  if (lastBall != undefined) {
    lastBall.material = lastBallResetMat;
  }
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);
  allBalls[col].push(ball);
  lastBall = ball;
  lastBallResetMat = BALL_MATERIALS[turn];
  const addAnimateLoop = () => {
    ball.position.y += (ball.position.yDestination - ball.position.y) * 0.25;
    if (Math.abs(ball.position.y - ball.position.yDestination) > 0.01) {
      requestAnimationFrame(addAnimateLoop);
    } else {
      ball.position.y = ball.position.yDestination;
      delete ball.position.yDestination;
      const audioObj = new Audio(sound);
      audioObj.addEventListener("canplaythrough", event => {
        /* the audio is now playable; play it if permissions allow */
        audioObj.volume = 0.2;
        audioObj.play();
      });
    }
  }
  addAnimateLoop();
};

gameCanvas.clear = () => {
  const clearLoop = () => {
    let hasBall = false;
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < allBalls[c].length; ++r) {
        const ball = allBalls[c][r];
        if (ball) {
          hasBall = true;
          ball.position.y += ((5 * r - 3 * Math.abs(3 - c) + 50) - ball.position.y) * 0.1;
          if (ball.position.y > 25) {
            scene.remove(ball);
            allBalls[c][r] = undefined;
          }
        }
      }
    }
    if (hasBall) {
      requestAnimationFrame(clearLoop);
    } else {
      allBalls = createGrid();
    }
  };
  clearLoop();
};

gameCanvas.render = render;

gameCanvas.onClickColumnEvent = () => {};

gameCanvas.annotate = (r, c, winner) => {
  if (r < allBalls[c].length) {
    allBalls[c][r].material = BALL_MATERIALS[winner + 2];
  }
}

export default gameCanvas;