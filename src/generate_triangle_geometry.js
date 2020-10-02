import * as THREE from 'three';

export default (width, height, depth) => {
  var geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3(-width/2, 0, 0),
    new THREE.Vector3(width/2, 0, 0),
    new THREE.Vector3(0, height, 0),
    new THREE.Vector3(-width/2, 0, depth),
    new THREE.Vector3(width/2, 0, depth),
    new THREE.Vector3(0, height, depth),
  );

  geometry.faces.push(new THREE.Face3( 0, 1,2 ));
  geometry.faces.push(new THREE.Face3( 4, 3, 5 ));
  geometry.faces.push(new THREE.Face3( 1, 4, 2 ));
  geometry.faces.push(new THREE.Face3( 2, 4, 5 ));
  geometry.faces.push(new THREE.Face3( 3, 0, 5 ));
  geometry.faces.push(new THREE.Face3( 5, 0, 2 ));
  geometry.faces.push(new THREE.Face3( 0, 3, 4 ));
  geometry.faces.push(new THREE.Face3( 0, 4, 1 ));

  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  geometry.computeFaceNormals();
  geometry.computeFlatVertexNormals();
  geometry.computeMorphNormals();
  geometry.computeVertexNormals();
  return geometry;
}