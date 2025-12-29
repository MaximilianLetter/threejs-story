import * as THREE from 'three';
import { SceneContext, SceneManager } from './core/SceneManager.ts';
import { Assets } from './core/AssetManager.ts';
import { Intro } from './scenes/Intro.ts';
import { Outro } from './scenes/Outro.ts';
import { Crowd } from './scenes/Crowd.ts';
import { AudioManager } from './audio/AudioManager.ts';
import { loadAudio } from './audio/AudioLoader.ts';
import { TextManager } from './ui/TextManager.ts';

async function bootstrap() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const audioManager = new AudioManager(camera);
  const textManager = new TextManager();
  
  // NOTE: context without functions bound to it, this is done in
  // the SceneManager constructor
  const ctxBase = {
    camera: camera,
    audio: audioManager,
    text: textManager,
  };

  const sceneManager = new SceneManager(renderer, ctxBase);

  // Loading Scene
  await sceneManager.changeScene(new Intro(sceneManager.getContext()));

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
    sceneManager.update(clock.getDelta());
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('pointerdown', () => {
    audioManager.listener.context.resume();
  }, { once: true });
}

bootstrap();