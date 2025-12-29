import * as THREE from 'three';
import { BaseScene } from '../core/BaseScene';
import { tweenToPromise } from '../utils/gsapPromise';
import { SceneContext } from '../core/SceneManager';
import TextContent from '../ui/TextContents.json';

export class Intro extends BaseScene {
  private cubeMaterial: THREE.Material;
  private cube!: THREE.Mesh;

  private waitForInput = false;

  constructor(ctx: SceneContext) {
    super(ctx);

    this.cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true });
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      this.cubeMaterial
    );
    this.scene.add(this.cube);

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);

    console.log('INTRO SCENE STARTED');
  }

  private clickToStart = async () => {
    if (!this.waitForInput) return;
    this.waitForInput = false;

    await this.ctx.next();
  }

  enter(): Promise<void> {
    this.text.showText('bottom', TextContent.intro.loading);

    this.cubeMaterial.opacity = 0;
    return tweenToPromise(this.cube.material, {
      opacity: 1, duration: 1,
      onComplete: () => {
        this.text.showText('bottom', TextContent.intro.ready, 1, -1);
        this.waitForInput = true;
        window.addEventListener('click', this.clickToStart);
      }
    });
  }

  update(dt: number) {
    this.cube.rotation.y += dt;
  }

  exit(): Promise<void> {
    window.removeEventListener('click', this.clickToStart);
    this.text.hideText('bottom', 1);
    return tweenToPromise(this.cube.material, { opacity: 0, duration: 1 });
  }

  dispose() {
    this.cube.geometry.dispose();
    this.cubeMaterial.dispose();
  }
}
