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
  // private personMaterial: THREE.Material;
  private personMaleMaterial: THREE.Material;
  private personFemaleMaterial: THREE.Material;
  private personGeometry: THREE.PlaneGeometry;
  private persons: THREE.Mesh[] = [];

  private buildingsAmount: number = 4;
  private buildingMaterial: THREE.Material;
  private buildingGeometry: THREE.BoxGeometry;
  private buildings: THREE.Mesh[] = [];

  private floorMaterial: THREE.Material;

  // Transition
  private animateInComplete: boolean = false;
  
  // Interaction
  private mouse = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();

  constructor(camera: THREE.Camera) {
    super(camera);

    // Camera controls
    this.controls = new OrbitControls(this.camera, document.body);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;

    // Crowd
    this.personMaleMaterial = new THREE.MeshBasicMaterial({
      map: Assets.textures.get('person_m'),
      transparent: false,
      alphaTest: 0.5
    }),
    this.personFemaleMaterial = new THREE.MeshBasicMaterial({
      map: Assets.textures.get('person_f'),
      transparent: false,
      alphaTest: 0.5
    }),
    this.personGeometry = new THREE.PlaneGeometry(0.2, 1);
    
    for (let i = 0; i < this.personsAmount; i++) {
      const person = new THREE.Mesh(
        this.personGeometry,
        Math.random() >= 0.5 ? this.personMaleMaterial : this.personFemaleMaterial
      );
      
      person.position.set(THREE.MathUtils.randFloat(-7.5, 7.5), 0.5, THREE.MathUtils.randFloat(-7.5, 7.5));

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
        this.enableInteraction();
      }
    });
  }

  private onClick = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.persons, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      console.log('HIT', hit);
    }
  };

  enableInteraction() {
    window.addEventListener('click', this.onClick);
  }

  disableInteraction() {
    window.removeEventListener('click', this.onClick)
  }

  update(dt: number) {
    if (!this.animateInComplete) return;

    this.controls.update();
  }

  exit(): Promise<void> {
    this.controls.enabled = false;
    this.disableInteraction();

    gsap.to(this.buildingMaterial, { opacity: 0, duration: 1 });
    gsap.to(this.personFemaleMaterial, { opacity: 0, duration: 1 });
    return tweenToPromise(this.personMaleMaterial, { opacity: 0, duration: 1 });
  }

  dispose() {
    this.personGeometry.dispose();
    this.personMaleMaterial.dispose();
    this.personFemaleMaterial.dispose();

    this.buildingGeometry.dispose();
    this.buildingMaterial.dispose();

    this.floorMaterial.dispose();

    this.controls.dispose();
  }
}
