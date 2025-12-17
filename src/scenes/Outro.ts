import * as THREE from 'three';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { tweenToPromise } from '../utils/gsapPromise';

export class Outro extends BaseScene {
  private sphereMaterial: THREE.Material;
  private sphere!: THREE.Mesh;

  constructor(camera: THREE.Camera) {
    super(camera);

    this.sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true });
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(),
      this.sphereMaterial
    );
    this.scene.add(this.sphere);

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
  }

  enter(): Promise<void> {
    this.sphereMaterial.opacity = 0;
    return tweenToPromise(this.sphere.material, { opacity: 1, duration: 1 });
  }

  update(dt: number) {
    this.sphere.rotation.y += dt;
  }

  exit(): Promise<void> {
    return tweenToPromise(this.sphere.material, { opacity: 0, duration: 1 })
  }

  dispose() {
    this.sphere.geometry.dispose();
    this.sphereMaterial.dispose();
  }
}
