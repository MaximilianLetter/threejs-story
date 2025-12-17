import * as THREE from 'three';
import { BaseScene } from './BaseScene';

export class SceneManager {
  private currentScene: BaseScene | null = null;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private camera: THREE.Camera
  ) {}

  async changeScene(newScene: BaseScene) {
    if (this.currentScene) {
      await this.currentScene.exit();
      this.currentScene.dispose();
    }

    this.currentScene = newScene;
    await newScene.enter();
  }

  update(dt: number) {
    this.currentScene?.update(dt);
    if (this.currentScene) {
      this.renderer.render(this.currentScene.getScene(), this.camera);
    }
  }
}
