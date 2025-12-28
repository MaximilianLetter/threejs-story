import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.ts';
import { Assets } from './core/AssetManager.ts';
import { Intro } from './scenes/Intro.ts';
import { Outro } from './scenes/Outro.ts';
import { Crowd } from './scenes/Crowd.ts';
import { AudioManager } from './audio/AudioManager.ts';
import { loadAudio } from './audio/AudioLoader.ts';

async function bootstrap() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const manager = new SceneManager(renderer, camera);
  const audioManager = new AudioManager(camera);

  // Loading Scene
  await manager.changeScene(new Intro(camera, audioManager));

  await Promise.all([
    Assets.loadTexture('crossroad', '/textures/crossroads_1024.png'),
    Assets.loadTexture('circle_mask', '/textures/circle_mask_512.png'),
    Assets.loadTexture('person_m', '/textures/pixelPerson_1.png', true),
    Assets.loadTexture('person_f', '/textures/pixelPerson_2.png', true),
  ]);

  // Warm up textures
  Assets.textures.forEach((texture) => {
    renderer.initTexture(texture);
  });

  // Load audio
  await loadAudio(audioManager);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    manager.update(clock.getDelta());
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // TODO: needs to click in into scene after loading is done -> start game
  window.addEventListener('pointerdown', () => {
    audioManager.listener.context.resume();
  }, { once: true });

  // Actual scenes
  await manager.changeScene(new Crowd(camera, audioManager));
}

bootstrap();