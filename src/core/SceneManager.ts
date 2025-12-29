import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import { AudioManager } from '../audio/AudioManager';
import { TextManager } from '../ui/TextManager';

export interface SceneContext {
  camera: THREE.Camera;
  audio: AudioManager;
  text: TextManager;
}

export class SceneManager {
  private currentScene: BaseScene | null = null;
  private ctx: SceneContext;

  constructor(
    private renderer: THREE.WebGLRenderer,
    ctx: SceneContext
  ) {
    this.ctx = ctx;
  }

  async changeScene(
    SceneClass: new (ctx: SceneContext) => BaseScene
  ) {
    if (this.currentScene) {
      await this.currentScene.exit();
      this.currentScene.dispose();
    }

    this.currentScene = new SceneClass(this.ctx);
    await this.currentScene.enter();
  }

  update(dt: number) {
    this.currentScene?.update(dt);
    if (this.currentScene) {
      this.renderer.render(this.currentScene.getScene(), this.ctx.camera);
    }
  }
}
