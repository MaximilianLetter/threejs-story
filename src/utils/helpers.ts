import * as THREE from 'three';

export function getLookAtQuaternion(
  camera: THREE.Camera,
  target: THREE.Vector3
): THREE.Quaternion {
  const dummy = camera.clone();
  dummy.lookAt(target);
  return dummy.quaternion.clone();
}