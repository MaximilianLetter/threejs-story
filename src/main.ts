import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.ts';
import { Intro } from './scenes/Intro.ts';
import { Outro } from './scenes/Outro.ts';
import { Crowd } from './scenes/Crowd.ts';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const manager = new SceneManager(renderer, camera);

manager.changeScene(new Crowd(camera));

// manager.changeScene(new Intro(camera));

// setTimeout(() => {
//   manager.changeScene(new Crowd(camera));
// }, 2 * 1000);

// setTimeout(() => {
//   manager.changeScene(new Outro(camera));
// }, 10 * 1000);

const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  manager.update(dt);

  // Happens in the SceneManager
  // renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);