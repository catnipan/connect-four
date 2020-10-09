import * as THREE from 'three';

export default (count, gap) => {

  const TRIVIAL_Y = 0.04;

  const size = count * gap;
  const half_size = size / 2;

  let points = [];  
  let x = 0;
  let z = 0;
  for (let i = 0; i <= count; ++i) {
    points.push(new THREE.Vector3(x - half_size, TRIVIAL_Y, z - half_size));
    points.push(new THREE.Vector3(x - half_size, TRIVIAL_Y, size - z - half_size));
    x += gap;
    z = size - z;
  }

  const zStep = count % 2 == 0 ? gap : -gap;
  for (let i = 0; i <= count; ++i) {
    points.push(new THREE.Vector3(x - half_size, TRIVIAL_Y, z - half_size));
    points.push(new THREE.Vector3(size - x - half_size, TRIVIAL_Y, z - half_size));
    x = size - x;
    z -= zStep;
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}
