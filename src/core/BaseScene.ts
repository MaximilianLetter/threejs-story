import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';

export abstract class BaseScene {
  protected scene = new THREE.Scene();
  protected camera: THREE.Camera;
  protected audio: AudioManager;

  constructor(camera: THREE.Camera, audio: AudioManager) {
    this.camera = camera;
    this.audio = audio;
  }

  getScene() {
    return this.scene;
  }

  abstract enter(): Promise<void> | void;
  abstract update(dt: number): void;
  abstract exit(): Promise<void> | void;
  abstract dispose(): void;
}