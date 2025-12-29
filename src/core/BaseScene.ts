import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';
import { SceneContext } from './SceneManager';
import { TextManager } from '../ui/TextManager';

export abstract class BaseScene {
  protected scene = new THREE.Scene();
  protected ctx: SceneContext;

  // Aliases
  protected camera: THREE.Camera;
  protected audio: AudioManager;
  protected text: TextManager;

  constructor(ctx: SceneContext) {
    this.ctx = ctx;
    
    this.camera = ctx.camera;
    this.audio = ctx.audio;
    this.text = ctx.text;
  }

  getScene() {
    return this.scene;
  }

  abstract enter(): Promise<void> | void;
  abstract update(dt: number): void;
  abstract exit(): Promise<void> | void;
  abstract dispose(): void;
}