import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import { AudioManager } from '../audio/AudioManager';
import { TextManager } from '../ui/TextManager';
import { Intro } from '../scenes/Intro';
import { Crowd } from '../scenes/Crowd';

export type SceneCreator = new (ctx: SceneContext) => BaseScene;

export const sceneFlow: SceneCreator[] = [
  Intro,
  Crowd,
];

export interface SceneContext {
  camera: THREE.Camera;
  audio: AudioManager;
  text: TextManager;

  next(): Promise<void>;
  goto(index: number): Promise<void>;
}

export class SceneManager {
  private index = 0;
  private currentScene: BaseScene | null = null;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private ctxBase: Omit<SceneContext, 'next' | 'goto'>
  ) {}

  async changeScene(scene: BaseScene): Promise<void> {
    if (this.currentScene) {
      await this.currentScene.exit();
      this.currentScene.dispose();
    }

    this.currentScene = scene;
    await scene.enter();
  }

  async next(): Promise<void> {
    const nextIndex = this.index + 1;
    if (!sceneFlow[nextIndex]) return;

    this.index = nextIndex;
    await this.changeScene(
      new sceneFlow[this.index](this.getContext())
    );
  }

  async goto(index: number): Promise<void> {
    if (!sceneFlow[index]) return;

    this.index = index;
    await this.changeScene(
      new sceneFlow[this.index](this.getContext())
    );
  }

  getContext(): SceneContext {
    // NOTE: builds ctx out of ctxBase and the function omitted in constructor
    return {
      ...this.ctxBase,
      next: this.next.bind(this),
      goto: this.goto.bind(this),
    };
  }

  update(dt: number) {
    this.currentScene?.update(dt);
    if (this.currentScene) {
      this.renderer.render(this.currentScene.getScene(), this.ctxBase.camera);
    }
  }
}
