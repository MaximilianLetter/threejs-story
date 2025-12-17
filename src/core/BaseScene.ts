import * as THREE from 'three';

export abstract class BaseScene {
  protected scene = new THREE.Scene();
  protected camera: THREE.Camera;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  getScene() {
    return this.scene;
  }

  abstract enter(): Promise<void> | void;
  abstract update(dt: number): void;
  abstract exit(): Promise<void> | void;
  abstract dispose(): void;
}