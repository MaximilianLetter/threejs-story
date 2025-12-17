import * as THREE from 'three';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { tweenToPromise } from '../utils/gsapPromise';

export class Intro extends BaseScene {
  private cubeMaterial: THREE.Material;
  private cube!: THREE.Mesh;

  constructor(camera: THREE.Camera) {
    super(camera);

    this.cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true });
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      this.cubeMaterial
    );
    this.scene.add(this.cube);

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
  }

  enter(): Promise<void> {
    this.cubeMaterial.opacity = 0;
    return tweenToPromise(this.cube.material, { opacity: 1, duration: 1 });
  }

  update(dt: number) {
    this.cube.rotation.y += dt;
  }

  exit(): Promise<void> {
    return tweenToPromise(this.cube.material, { opacity: 0, duration: 1 });
  }

  dispose() {
    this.cube.geometry.dispose();
    this.cubeMaterial.dispose();
  }
}
