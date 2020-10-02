import * as THREE from 'three';
import Stats from 'stats.js';
import "./style.css";
import { default as generateTriangleGeometry } from './generate_triangle_geometry';
import pw from '../asset/matcap-porcelain-white.jpg';
import wt from '../asset/wood.jpg';
import mt from '../asset/metal.jpg';
import fontData from '../asset/font_data.json';

// var stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild( stats.dom );

const CONTROLLER = {
  onClick: () => {},
  getIsValid: () => true,
};
var controller = CONTROLLER;
function setController(h) {
  controller = h;
}
function clearController() {
  controller = CONTROLLER;
}

const COLORS = {
  bar: 0xb3b3b3,
  barEmissive: 0x828282,
  player1: 0xffee00,
  player2: 0xff0000,
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const GRAVITY = 0.4;
const ROWS = 6;
const COLS = 7;
const BALL_DIAMETER = 12;
const SIGN_RADIUS = 4;
const BAR_WIDTH = 1;

const CAMERA_MOVE_RANGE = 3;

const COLUMN_COUNT = new Array(COLS).fill(0);

const FRAME_WIDTH = COLS * (BALL_DIAMETER + BAR_WIDTH) + BAR_WIDTH;
const FRAME_HEIGHT = ROWS * BALL_DIAMETER;

const ACTIVE_SIGN_OBJECT_MOTION_SPEED = 0.1;
const ACTIVE_SIGN_OBJECT_Y = FRAME_HEIGHT + 7;

const getXbyColumn = col => (BALL_DIAMETER + BAR_WIDTH) * (col + 0.5);
const triangleGeometry = generateTriangleGeometry(8, 4, 3);

const COLUMN_PREFIX = "COLUMN_";
// const matCapPorcelainWhite = new THREE.TextureLoader().load(pw);
const woodTexture = new THREE.TextureLoader().load(wt);
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(1, 1);
const metalTexture = new THREE.TextureLoader().load(mt);
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
metalTexture.repeat.set(1, 1);
// var barMaterial = new THREE.MeshLambertMaterial({ map: woodTexture, emissive: 0x4d4d4d });
var barMaterial = new THREE.MeshPhongMaterial({ color: 0xe3e3e3 });
var textMaterial = new THREE.MeshMatcapMaterial({ map: metalTexture });
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, CANVAS_WIDTH/CANVAS_HEIGHT, 0.1, 1000 );
// var camera = new THREE.OrthographicCamera(-FRAME_WIDTH, FRAME_WIDTH, -FRAME_HEIGHT, FRAME_HEIGHT, 0.1, 1000);
var ambientLight = new THREE.AmbientLight(0x4f4f4f);
scene.add(ambientLight);
scene.background = new THREE.Color(0xffffff);

var light = new THREE.SpotLight( 0x8c8c8c );
light.position.set(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 250);
light.castShadow = true;
scene.add(light);
// var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
// directionalLight.position.set(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 150);
// directionalLight.castShadow = true;
// scene.add(directionalLight);

// var axes = new THREE.AxesHelper(100);
// scene.add(axes);

var geometry = new THREE.BoxGeometry( BAR_WIDTH, FRAME_HEIGHT, BALL_DIAMETER );
for (let i = 0; i < COLS + 1; ++i) {
  var bar = new THREE.Mesh( geometry, barMaterial );
  bar.position.y = FRAME_HEIGHT / 2;
  bar.position.x = (BALL_DIAMETER + BAR_WIDTH) * i;
  bar.receiveShadow = true;
  scene.add(bar);
}
var backBarGeometry = new THREE.BoxGeometry( FRAME_WIDTH, FRAME_HEIGHT, BAR_WIDTH );
var backBar = new THREE.Mesh( backBarGeometry, barMaterial );
backBar.position.x = FRAME_WIDTH / 2;
backBar.position.y = FRAME_HEIGHT / 2;
backBar.position.z = - BALL_DIAMETER / 2;
backBar.receiveShadow = true;
scene.add(backBar);

var bottomBarGeometry = new THREE.BoxGeometry( FRAME_WIDTH, BAR_WIDTH, BALL_DIAMETER);
var bottomBar = new THREE.Mesh(bottomBarGeometry, barMaterial);
bottomBar.position.x = FRAME_WIDTH / 2 - BAR_WIDTH / 2;
bottomBar.position.y = 0;
bottomBar.position.z = 0;
bottomBar.receiveShadow = true;
scene.add(bottomBar);

// fake column
const FAKE_COLUMNS = [];
const FAKE_COLUMN_HEIGHT = FRAME_HEIGHT;
for (let c = 0; c < COLS; ++c) {
  var columnGeometry = new THREE.BoxGeometry(BALL_DIAMETER, FAKE_COLUMN_HEIGHT, BALL_DIAMETER);
  var columnMaterial = new THREE.MeshBasicMaterial({ visible: false });
  // columnMaterial.depthWrite = false;
  var column = new THREE.Mesh(columnGeometry, columnMaterial);
  column.position.x = getXbyColumn(c);
  column.position.y = FAKE_COLUMN_HEIGHT / 2;
  column.name = `${COLUMN_PREFIX}${c}`;
  FAKE_COLUMNS.push(column);
  scene.add(column);
}

let animationBalls = [];
let ballGeom =  new THREE.SphereGeometry( BALL_DIAMETER / 2, 30, 30 );
let ballMaterials = [
  new THREE.MeshToonMaterial( { color: COLORS.player1 } ),
  new THREE.MeshToonMaterial( { color: COLORS.player2 } )
];

let allBalls = [];
function add(r, c, player) {
  let ball = new THREE.Mesh(ballGeom, ballMaterials[player]);
  const target_x = getXbyColumn(c);
  const inital_y = FRAME_HEIGHT + BALL_DIAMETER / 2;
  const target_y = BALL_DIAMETER * (r + 0.5);
  ball.position.destinationY = target_y;
  ball.position.y = inital_y;
  ball.position.x = target_x;
  ball.castShadow = true;
  ball.receiveShadow = true;
  animationBalls.push(ball);
  scene.add(ball);
  allBalls.push(ball);
}

function clear() {
  for (let ball of allBalls) {
    scene.remove(ball);
  }
  allBalls = [];
}

const CAMERA_X = FRAME_WIDTH * 0.5;
const CAMERA_Y = FRAME_HEIGHT * 0.6;

camera.position.x = CAMERA_X;
camera.position.y = CAMERA_Y;
camera.position.destinationY = camera.position.y;
camera.position.destinationX = camera.position.x;
camera.position.z = 100;
camera.lookAt(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 0);

var activeColumn;
var activeSignObject;
var activeSignObjectMotionClock;

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
function onMouseMove( event ) {
	mouse.x = ( event.clientX / CANVAS_WIDTH ) * 2 - 1;
  mouse.y = - ( event.clientY / CANVAS_HEIGHT ) * 2 + 1;
  // camera.position.
  camera.position.destinationX = CAMERA_X + CAMERA_MOVE_RANGE * mouse.x;
  camera.position.destinationY = CAMERA_Y + CAMERA_MOVE_RANGE * mouse.y;
  raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects(FAKE_COLUMNS);
  // console.log(intersects);
  let nextActiveColumn = undefined;
	for ( var i = 0; i < intersects.length; i++ ) {
    // intersects[i].object.translateY(10);
    nextActiveColumn = parseInt(intersects[i].object.name.substr(COLUMN_PREFIX.length));
  }
  if (nextActiveColumn != activeColumn) {
    activeColumn = nextActiveColumn;
    if (controller.getIsValid(activeColumn)) {
      var material = new THREE.MeshLambertMaterial({ color: 'red' });
      scene.remove(activeSignObject); // remove old one
      activeSignObject = new THREE.Mesh(triangleGeometry, material);
      activeSignObject.position.x = getXbyColumn(activeColumn);
      activeSignObject.position.y = ACTIVE_SIGN_OBJECT_Y;
      activeSignObject.rotateX(Math.PI);
      scene.add(activeSignObject);
      activeSignObjectMotionClock = 0;
    }
  }
}

var textGeometry = new THREE.TextGeometry('CONNECT FOUR', {
  font: new THREE.FontLoader().parse(fontData),
  size: 10,
  height: BALL_DIAMETER,
  curveSegments: 12,
  bevelEnabled: false,
  bevelThickness: 1,
  bevelSize: 2,
  bevelOffset: 0,
  bevelSegments: 1,
} );
var textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.x = -1;
textMesh.position.y = -12;
textMesh.position.z = - BALL_DIAMETER / 2;
scene.add(textMesh);

function renderLoop() {
  // stats.begin();
  if (activeColumn != undefined) {
    if (controller.getIsValid(activeColumn)) {
      activeSignObjectMotionClock += ACTIVE_SIGN_OBJECT_MOTION_SPEED;
      // activeSignObject.position.y = ACTIVE_SIGN_OBJECT_Y + Math.sin(activeSignObjectMotionClock);
      // document.body.style.cursor = 'pointer';
    } else {
      scene.remove(activeSignObject);
      // document.body.style.cursor = 'not-allowed';
    }
  } else {
    // document.body.style.cursor = 'default`';
  }
  let nextAnimationBalls = [];
  for (const ball of animationBalls) {
    ball.position.y += Math.min(-0.01, (ball.position.destinationY - ball.position.y) * 0.15);
    if (Math.abs(ball.position.y - ball.position.destinationY) < 0.01) {
      ball.position.y = ball.position.destinationY;
      delete ball.position.destinationY;
    } else {
      nextAnimationBalls.push(ball);
    }
  }
  camera.position.y += (camera.position.destinationY - camera.position.y) * 0.15;
  camera.position.x += (camera.position.destinationX - camera.position.x) * 0.15;
  camera.lookAt(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 0);
  animationBalls = nextAnimationBalls;
  renderer.render(scene, camera);
  // stats.end();
  requestAnimationFrame(renderLoop);
}

var renderer = new THREE.WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );

var currPlayer = 0;
function onMouseClick() {
  controller.onClick(activeColumn);
  // if (activeColumn != undefined && COLUMN_COUNT[activeColumn] < ROWS) {
    // add(COLUMN_COUNT[activeColumn], activeColumn, currPlayer);
    // COLUMN_COUNT[activeColumn]++;
    // currPlayer = 1 - currPlayer;
  // }
}

function render(dom) {
  document.getElementById(dom).appendChild(renderer.domElement);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  renderLoop();
}

export default {
  add,
  clear,
  setController,
  clearController,
  render,
}