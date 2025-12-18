import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BaseScene } from '../core/BaseScene';
import { tweenToPromise } from '../utils/gsapPromise';
import { randomWalk } from '../utils/gsapRandomWalk';
import { Assets } from '../core/AssetManager';

export class Crowd extends BaseScene {
  private controls!: OrbitControls;

  // Initialization
  private personsAmount: number = 500;
  private personMaterial: THREE.Material;
  private personGeometry: THREE.BoxGeometry;
  private persons: THREE.Mesh[] = [];

  private buildingsAmount: number = 4;
  private buildingMaterial: THREE.Material;
  private buildingGeometry: THREE.BoxGeometry;
  private buildings: THREE.Mesh[] = [];

  private floorMaterial: THREE.Material;

  // Transition
  private animateInComplete: boolean = false;

  constructor(camera: THREE.Camera) {
    super(camera);

    // Camera controls
    this.controls = new OrbitControls(this.camera, document.body);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;

    // Crowd
    this.personMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true });
    this.personGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    
    for (let i = 0; i < this.personsAmount; i++) {
      const person = new THREE.Mesh(
        this.personGeometry,
        this.personMaterial
      );
      
      person.position.set(THREE.MathUtils.randFloat(-5, 5), 0.5, THREE.MathUtils.randFloat(-5, 5));

      this.persons.push(person);
      this.scene.add(person);

      randomWalk(person, { range: 4, durationMin: 2, durationMax: 4 });
    }

    // Buildings
    this.buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xdddddd, transparent: true });
    this.buildingGeometry = new THREE.BoxGeometry(2, 10, 2);

    for (let i = 0; i < this.buildingsAmount; i++) {
      const building = new THREE.Mesh(
        this.buildingGeometry,
        this.buildingMaterial
      );
      
      building.position.set(-10 + (i * 7), 5, -4 -((i % 3) * 5));

      this.buildings.push(building);
      this.scene.add(building);
    }

    // Floor
    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: Assets.textures.get('floor_concrete'),
      alphaMap: Assets.textures.get('circle_mask'),
      transparent: true
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      this.floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(light);

    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(dLight);

    console.log('CROWD SCENE STARTED');
  }

  enter(): Promise<void> {
    this.controls.enabled = false;

    const cameraHeight = 5;

    // Set position to match lookAt rotation of orbit control later
    this.camera.position.set(0, cameraHeight, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.camera.position.set(0, 75, 10);

    return tweenToPromise(this.camera.position, {
      y: cameraHeight,
      duration: 2,
      ease: "power3.inOut",
      onComplete:() => {
        this.animateInComplete = true;
        this.controls.enabled = true;
      }
    });
  }

  update(dt: number) {
    if (!this.animateInComplete) return;

    this.controls.update();
  }

  exit(): Promise<void> {
    this.controls.enabled = false;

    gsap.to(this.buildingMaterial, { opacity: 0, duration: 1 });
    return tweenToPromise(this.personMaterial, { opacity: 0, duration: 1 });
  }

  dispose() {
    this.personGeometry.dispose();
    this.personMaterial.dispose();

    this.buildingGeometry.dispose();
    this.buildingMaterial.dispose();

    this.controls.dispose();
  }
}
