import * as THREE from 'three';
import Stats from 'stats.js';
import "./style.css";
import { default as generateTriangleGeometry } from './generate-triangle-geometry';
import pw from '../asset/matcap-porcelain-white.jpg';
import woodTextureSource from '../asset/floor-wood.jpg';
import mt from '../asset/metal.jpg';
import ballTextureSource from '../asset/ball.png';
import fontData from '../asset/font_data.json';
import * as dat from 'dat.gui';
import store from './store';

var stats = new Stats();
stats.showPanel(0);
// document.body.appendChild( stats.dom );
var gui = new dat.GUI({
  autoPlace: false,
  height : (32 * 3)- 1
});
var params = {
  fov: 60,
  cameraZ: 100,
  barColor: '#b3b3b3',
  barEmissiveColor: '#000000',
}
gui.add(params, 'fov', 0, 100, 1);
gui.addColor(params, 'barColor');
gui.addColor(params, 'barEmissiveColor');

const COLORS = {
  bar: 0xb3b3b3,
  barEmissive: 0x828282,
  player1: 0xffee00,
  player2: 0xff0000,
};

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

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
// const woodTexture = new THREE.TextureLoader().load(woodTextureSource);
// // woodTexture.wrapS = THREE.RepeatWrapping;
// // woodTexture.wrapT = THREE.RepeatWrapping;
// woodTexture.repeat.set(1, 1);
// const metalTexture = new THREE.TextureLoader().load(mt);
// woodTexture.wrapS = THREE.RepeatWrapping;
// woodTexture.wrapT = THREE.RepeatWrapping;
// metalTexture.repeat.set(1, 1);
// const ballTexture = new THREE.TextureLoader().load(ballTextureSource);

// var barMaterial = new THREE.MeshPhongMaterial({
//   color: 0xd9d9d9,
//   // emissive: 0x0d0d0d,
//   // transparent: true,
//   // opacity: 0.4,
//   // specular: `rgb(53,53,53)`,
//   map: woodTexture,
//   shininess: 1,
// });
// // var barMaterial = new THREE.MeshPhongMaterial({ color: 0xe3e3e3 });
// var textMaterial = new THREE.MeshMatcapMaterial({ map: metalTexture });
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( params.fov, CANVAS_WIDTH/CANVAS_HEIGHT, 0.1, 1000);

// // var camera = new THREE.OrthographicCamera(-FRAME_WIDTH, FRAME_WIDTH, -FRAME_HEIGHT, FRAME_HEIGHT, 0.1, 1000);
// var ambientLight = new THREE.AmbientLight(0x4f4f4f);
// scene.add(ambientLight);
// scene.background = new THREE.Color(0x000000);

// // var backBarGeometry = new THREE.BoxGeometry( FRAME_WIDTH, FRAME_HEIGHT, BAR_WIDTH );
// // var backBar = new THREE.Mesh( backBarGeometry, barMaterial );
// // backBar.position.x = FRAME_WIDTH / 2;
// // backBar.position.y = FRAME_HEIGHT / 2;
// // backBar.position.z = - BALL_DIAMETER / 2;
// // backBar.receiveShadow = true;
// // scene.add(backBar);
// let ballGeom =  new THREE.SphereGeometry( BALL_DIAMETER / 2, 30, 30 );
// let ballMaterials = [
//   new THREE.MeshPhongMaterial( { color: COLORS.player1,  
//   shininess: 80 } ),
//   new THREE.MeshPhongMaterial( {
//     color: COLORS.player2, 
//     specular: `rgb(48,45,45)`,
//     transparent: false, shininess: 30
//   } )
// ];
// var planeGeometry = new THREE.PlaneGeometry(FRAME_WIDTH * 3, FRAME_WIDTH * 3, 120, 120);
// var planeMaterial = new THREE.MeshPhongMaterial({
//     color: 0xffffff
// });
// planeGeometry.rotateX(90);
// var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.position.z = -300;
// plane.receiveShadow = true;

// // rotate and position the plane
// plane.rotation.x = -0.5 * Math.PI;
// plane.position.x = 15;
// plane.position.y = 0;
// plane.position.z = 0;

// scene.add(plane);


// let ball = new THREE.Mesh(ballGeom, ballMaterials[0]);
// ball.position.y = 10;
// ball.position.x = 0;
// ball.position.z = -50;
// ball.castShadow = true;
// ball.receiveShadow = true;
// scene.add(ball);

// var light = new THREE.SpotLight( 0xffffff );
// light.position.set(100 , 500, 80);
// // var tg = new THREE.Object3D();
// // tg.position = new THREE.Vector3(300, 400, 0);
// light.target = ball;
// light.castShadow = true;
// light.distance = 800;
// light.angle = 0.5;
// light.penumbra = 1;

// light.shadow.mapSize.width = 1024;
// light.shadow.mapSize.height = 1024;

// light.shadow.camera.near = 10;
// light.shadow.camera.far = 400;
// light.shadow.camera.fov = 40;

// // light.target.position.set(100, 100, 100);

// var debugCamera = new THREE.CameraHelper(light.shadow.camera);
// var pp = new THREE.SpotLightHelper(light);
// scene.add(pp);
// // scene.add(tg);
// scene.add(light);
// scene.add(debugCamera);
// console.log(light.target);
// // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
// // directionalLight.position.set(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 150);
// // directionalLight.castShadow = true;
// // scene.add(directionalLight);

// // var axes = new THREE.AxesHelper(100);
// // scene.add(axes);


// var geometry = new THREE.BoxGeometry( BAR_WIDTH, FRAME_HEIGHT, BALL_DIAMETER );
// // for (let i = 0; i < COLS + 1; ++i) {
// //   var bar = new THREE.Mesh( geometry, barMaterial );
// //   bar.position.y = FRAME_HEIGHT / 2;
// //   bar.position.x = (BALL_DIAMETER + BAR_WIDTH) * i;
// //   bar.receiveShadow = true;
// //   scene.add(bar);
// // }


// // var bottomBarGeometry = new THREE.BoxGeometry( FRAME_WIDTH, BAR_WIDTH, BALL_DIAMETER);
// // var bottomBar = new THREE.Mesh(bottomBarGeometry, barMaterial);
// // bottomBar.position.x = FRAME_WIDTH / 2 - BAR_WIDTH / 2;
// // bottomBar.position.y = 0;
// // bottomBar.position.z = 0;
// // bottomBar.receiveShadow = true;
// // scene.add(bottomBar);

// // fake column
// const FAKE_COLUMNS = [];
// // const FAKE_COLUMN_HEIGHT = FRAME_HEIGHT;
// // for (let c = 0; c < COLS; ++c) {
// //   var columnGeometry = new THREE.BoxGeometry(BALL_DIAMETER, FAKE_COLUMN_HEIGHT, BALL_DIAMETER);
// //   var columnMaterial = new THREE.MeshBasicMaterial({ visible: false });
// //   // columnMaterial.depthWrite = false;
// //   var column = new THREE.Mesh(columnGeometry, columnMaterial);
// //   column.position.x = getXbyColumn(c);
// //   column.position.y = FAKE_COLUMN_HEIGHT / 2;
// //   column.name = `${COLUMN_PREFIX}${c}`;
// //   FAKE_COLUMNS.push(column);
// //   scene.add(column);
// // }

// let animationBalls = [];


// let allBalls = [];
// function add(r, c, player) {
//   let ball = new THREE.Mesh(ballGeom, ballMaterials[player]);
//   const target_x = getXbyColumn(c);
//   const inital_y = FRAME_HEIGHT + BALL_DIAMETER / 2;
//   const target_y = BALL_DIAMETER * (r + 0.5);
//   ball.position.destinationY = target_y;
//   ball.position.y = inital_y;
//   ball.position.x = target_x;
//   ball.position.z = -50;
//   ball.castShadow = true;
//   ball.receiveShadow = true;
//   animationBalls.push(ball);
//   scene.add(ball);
//   allBalls.push(ball);
// }

// add(0, 1, 0);
// add(1, 1, 1);
// add(0, 2, 1);
// add(0, 3, 0);

// function clear() {
//   for (let ball of allBalls) {
//     scene.remove(ball);
//   }
//   allBalls = [];
// }

// const CAMERA_X = FRAME_WIDTH * 0.5;
// const CAMERA_Y = FRAME_HEIGHT * 0.6;

// camera.position.x = CAMERA_X;
// camera.position.y = CAMERA_Y;
// camera.position.destinationY = camera.position.y;
// camera.position.destinationX = camera.position.x;
// camera.position.z = 200;
// camera.lookAt(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 0);

// var activeColumn;
// var activeSignObject;
// var activeSignObjectMotionClock;

// var mouse = new THREE.Vector2();
// var raycaster = new THREE.Raycaster();
// function onMouseMove( event ) {
// 	mouse.x = ( event.clientX / CANVAS_WIDTH ) * 2 - 1;
//   mouse.y = - ( event.clientY / CANVAS_HEIGHT ) * 2 + 1;
//   // camera.position.
//   camera.position.destinationX = CAMERA_X + CAMERA_MOVE_RANGE * mouse.x;
//   camera.position.destinationY = CAMERA_Y + CAMERA_MOVE_RANGE * mouse.y;
//   raycaster.setFromCamera( mouse, camera );

// 	// calculate objects intersecting the picking ray
// 	var intersects = raycaster.intersectObjects(FAKE_COLUMNS);
//   // console.log(intersects);
//   let nextActiveColumn = undefined;
// 	for ( var i = 0; i < intersects.length; i++ ) {
//     // intersects[i].object.translateY(10);
//     nextActiveColumn = parseInt(intersects[i].object.name.substr(COLUMN_PREFIX.length));
//   }
//   if (nextActiveColumn != activeColumn) {
//     activeColumn = nextActiveColumn;
//     if (controller.getIsValid(activeColumn)) {
//       var material = new THREE.MeshLambertMaterial({ color: 'red' });
//       scene.remove(activeSignObject); // remove old one
//       activeSignObject = new THREE.Mesh(triangleGeometry, material);
//       activeSignObject.position.x = getXbyColumn(activeColumn);
//       activeSignObject.position.y = ACTIVE_SIGN_OBJECT_Y;
//       activeSignObject.rotateX(Math.PI);
//       scene.add(activeSignObject);
//       activeSignObjectMotionClock = 0;
//     }
//   }
// }

// var textGeometry = new THREE.TextGeometry('CONNECT FOUR', {
//   font: new THREE.FontLoader().parse(fontData),
//   size: 10,
//   height: BALL_DIAMETER,
//   curveSegments: 12,
//   bevelEnabled: false,
//   bevelThickness: 1,
//   bevelSize: 2,
//   bevelOffset: 0,
//   bevelSegments: 1,
// } );
// var textMesh = new THREE.Mesh(textGeometry, textMaterial);
// textMesh.position.x = -1;
// textMesh.position.y = -12;
// textMesh.position.z = - BALL_DIAMETER / 2;
// scene.add(textMesh);

// function renderLoop() {
//   stats.begin();
//   if (activeColumn != undefined) {
//     if (controller.getIsValid(activeColumn)) {
//       activeSignObjectMotionClock += ACTIVE_SIGN_OBJECT_MOTION_SPEED;
//       // activeSignObject.position.y = ACTIVE_SIGN_OBJECT_Y + Math.sin(activeSignObjectMotionClock);
//       // document.body.style.cursor = 'pointer';
//     } else {
//       scene.remove(activeSignObject);
//       // document.body.style.cursor = 'not-allowed';
//     }
//   } else {
//     // document.body.style.cursor = 'default`';
//   }
//   let nextAnimationBalls = [];
//   for (const ball of animationBalls) {
//     ball.position.y += Math.min(-0.01, (ball.position.destinationY - ball.position.y) * 0.15);
//     if (Math.abs(ball.position.y - ball.position.destinationY) < 0.01) {
//       ball.position.y = ball.position.destinationY;
//       delete ball.position.destinationY;
//     } else {
//       nextAnimationBalls.push(ball);
//     }
//   }
//   camera.position.y += (camera.position.destinationY - camera.position.y) * 0.15;
//   camera.position.x += (camera.position.destinationX - camera.position.x) * 0.15;
//   camera.lookAt(FRAME_WIDTH / 2, FRAME_HEIGHT / 2, 0);
//   camera.fov = params.fov;
//   camera.position.z = params.cameraZ;
//   camera.updateProjectionMatrix();

//   ballMaterials[0].color = new THREE.Color(params.barColor);
//   ballMaterials[0].emissive = new THREE.Color(params.barEmissiveColor);
//   ballMaterials[0].needsUpdate = true;

//   animationBalls = nextAnimationBalls;
//   renderer.render(scene, camera);
//   stats.end();
//   requestAnimationFrame(renderLoop);
// }

var renderer = new THREE.WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );


function onMouseClick() {
  // controller.onClick(activeColumn);
  store.dispatch({
    type: 'SEND_TO_SERVER',
    payload: `/move ${activeColumn}`,
  })
  // if (activeColumn != undefined && COLUMN_COUNT[activeColumn] < ROWS) {
    // add(COLUMN_COUNT[activeColumn], activeColumn, currPlayer);
    // COLUMN_COUNT[activeColumn]++;
  // }
}

function render(dom) {
  document.getElementById(dom).appendChild(renderer.domElement);
  document.getElementById('gui').appendChild(gui.domElement);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('click', onMouseClick, false);
  renderLoop();
}

export default {
  add: () => {},
  clear: () => {},
  render,
}