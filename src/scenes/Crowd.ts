import * as THREE from 'three';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { timelineToPromise, tweenToPromise } from '../utils/gsapPromise';
import { randomWalk, stopRandomWalk } from '../utils/gsapRandomWalk';
import { Assets } from '../core/AssetManager';
import { getLookAtQuaternion } from '../utils/helpers';
import { SoundIds } from '../audio/SoundIds';
import { SceneContext } from '../core/SceneManager';
import TextContent from '../ui/TextContents.json';

export class Crowd extends BaseScene {
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
  private cameraBasePosition = new THREE.Vector3(0, 5, 10);
  private mouse = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();

  private interactionEnabled = false;
  private highlightedObj?: THREE.Mesh;
  private selectedPersons: THREE.Mesh[] = [];
  private amountOfPersonsToSelect: number = 3;

  private focusObj: THREE.Mesh | null = null;

  private story = {
    step: 0,
    lastStepTime: 0,
    stepDelay: 0
  }
  // 0 -> intro
  // 1 -> instruction 1
  // 2 -> instruction 2

  constructor(ctx: SceneContext) {
    super(ctx);

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
    this.personGeometry = new THREE.PlaneGeometry(0.4, 1);
    this.personGeometry.translate(0, 0.5, 0);
    
    for (let i = 0; i < this.personsAmount; i++) {
      const person = new THREE.Mesh(
        this.personGeometry,
        Math.random() >= 0.5 ? this.personMaleMaterial : this.personFemaleMaterial
      );
      this.setupHoverAnimation(person);
      
      person.position.set(THREE.MathUtils.randFloat(-7.5, 7.5), 0.5, THREE.MathUtils.randFloat(-7.5, 7.5));

      // Mark person as colored or not
      const everyNthPerson = 5;
      if (i % everyNthPerson === 0) {
        person.userData.special = true;
        person.userData.specialColor = this.generateRandomColor();
      } else {
        person.userData.special = false;
      }

      this.persons.push(person);
      this.scene.add(person);

      randomWalk(person, { range: 3, durationMin: 3, durationMax: 4 });
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
      map: Assets.textures.get('crossroad'),
      alphaMap: Assets.textures.get('circle_mask'),
      transparent: true
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
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
    // Set position to match lookAt rotation of orbit control later
    this.camera.position.copy(this.cameraBasePosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.audio.play(SoundIds.CROWD_AMBIENT, { volume: 0.1, loop: true, reference: 'ambient' });

    this.camera.position.set(0, 75, 10);

    const tl = gsap.timeline();

    tl.add(this.text.showText('top', TextContent.crowd.enter1, 1, 3));
    tl.add(this.text.showText('top', TextContent.crowd.enter2, 1, 3));
    tl.add(gsap.to(this.camera.position, {
      y: this.cameraBasePosition.y,
      duration: 2,
      ease: "power3.inOut",
      onComplete:() => {
        this.animateInComplete = true;
        this.enableInteraction();

        this.mouse.set(-1, 1); // Set in corner instead of screen center

        this.story.step = 1;
        this.story.lastStepTime = Date.now();
      }
    }), '-=1.5');

    return timelineToPromise(tl);
  }

  // NOTE: this syntax is required for adding it to event listeners
  private selectPerson = () => {
    const obj = this.highlightedObj;

    if (!obj || !this.interactionEnabled) return;

    // NOTE: if unspecial, maybe show text about only selecting persons
    // that do stand out of the crowd
    if (!obj.userData.special) {
      this.audio.play(SoundIds.SELECT_FAIL);
      return;
    }

    if (this.selectedPersons.includes(obj)) return;

    this.audio.play(SoundIds.SELECT);
    stopRandomWalk(obj);

    // NOTE: adding to array keeps the object from losing its color again
    this.selectedPersons.push(obj);

    if (this.selectedPersons.length >= this.amountOfPersonsToSelect) {
      this.zoomToPerson();
    } else {
      if (this.story.step === 2 && this.nextStoryStepTime()) {
        this.text.showText('top', TextContent.crowd.instruction2, 1, 3);
        this.story.step++;
        this.story.lastStepTime = Date.now();
      }
    }
  }

  zoomToPerson() {
    if (!this.highlightedObj || !this.interactionEnabled) return;

    this.focusObj = this.highlightedObj;

    stopRandomWalk(this.focusObj);

    // Timeline for effect animation
    const tl = gsap.timeline();
    
    tl.add(this.audio.fadeVolume('ambient', 2, 0));
    tl.add(this.fadeOutMaterial(this.personMaleMaterial, 2), '<');
    tl.add(this.fadeOutMaterial(this.personFemaleMaterial, 2), '<');

    if (this.selectedPersons.length) {
      // Fade out everything except the last one
      for (let i = 0; i < this.selectedPersons.length - 1; i++) {
        const m = this.selectedPersons[i].material as THREE.Material;

        tl.add(this.fadeOutMaterial(m, 2), '<0.5');
      }
    }
    
    tl.add(this.fadeOutMaterial(this.buildingMaterial, 2));
    tl.add(this.fadeOutMaterial(this.floorMaterial, 2), '<');

    // Interaction is done, dont allow raycasting against other persons
    this.interactionEnabled = false;
    
    const targetPos = this.focusObj.localToWorld(new THREE.Vector3(0, 0.5, 0));
    const targetQuat = getLookAtQuaternion(this.camera, targetPos);

    tl.add(gsap.to(this.camera.quaternion, {
        x: targetQuat.x,
        y: targetQuat.y,
        z: targetQuat.z,
        w: targetQuat.w,
        duration: 2,
        ease: 'power2.inOut'
      }), '<')
      .add(gsap.to(this.camera.position, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z + 1,
        duration: 4,
        ease: 'power2.inOut',
        onUpdate: () => { this.camera.lookAt(targetPos) },
        onComplete: () => { console.log('Focus complete') }
      }))
      .add(this.text.showText('top', TextContent.crowd.leave, 1, 3), '<-2');
  };

  fadeOutMaterial(mat: THREE.Material, duration: number) {
    mat.transparent = true;
    mat.alphaTest = 0;
    mat.depthWrite = false;

    return gsap.to(mat, {
      opacity: 0,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        mat.visible = false;
      }
    });
  }

  private hover = (e: PointerEvent) => {
    if ( e.isPrimary === false ) return;

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.persons, true);

    // Reset function
    const resetHighlight = () => {
      if (this.highlightedObj) {
        // If person was selected, it shall stay highlighted 
        if (this.selectedPersons.includes(this.highlightedObj)) return;

        if (this.highlightedObj.userData.uniqueMaterial) {
          this.highlightedObj.material = this.highlightedObj.userData.ogMat;
          this.highlightedObj.userData.uniqueMaterial = false;
        }

        this.highlightedObj = undefined;
      }
    }

    if (intersects.length > 0) {
      const hit = intersects[0];
      const obj = hit.object;

      if (obj != this.highlightedObj) {
        // Reset previously highlighted Obj
        resetHighlight();

        // Highlight new highlighted Obj
        if (obj instanceof THREE.Mesh) {
          if (!obj.userData.uniqueMaterial) {
            obj.userData.ogMat = obj.material;
            obj.material = obj.material.clone();
            obj.userData.uniqueMaterial = true;
          }

          // Give color if special
          if (obj.userData.special) obj.material.color.copy(obj.userData.specialColor);

          // Play hover animation
          obj.userData.hoverTl.restart();

          this.highlightedObj = obj;

          if (this.story.step === 1 && this.nextStoryStepTime()) {
            this.text.showText('top', TextContent.crowd.instruction1, 1, 3);
            this.story.step++;
            this.story.lastStepTime = Date.now();
          }
        }
      }
    } else {
      // Only reset
      resetHighlight();
    }
  }

  generateRandomColor(): THREE.Color {
    const color = new THREE.Color();
    color.setHSL(
      Math.random(),
      0.8,
      0.6
    );

    return color;
  }

  nextStoryStepTime() {
    return this.story.lastStepTime + this.story.stepDelay < Date.now();
  }

  setupHoverAnimation(obj: THREE.Object3D) {
    if (obj.userData.hoverTl) return;

    obj.userData.hoverTl = gsap.timeline({ paused: true })
      .to(obj.scale, {
        x: 1.25,
        y: 1.25,
        duration: 0.125,
        ease: 'power2.inOut',
      })
      .to(obj.scale, {
        x: 1,
        y: 1,
        duration: 0.125,
        ease: 'power2.inOut',
      });
  }

  enableInteraction() {
    window.addEventListener('pointermove', this.hover);
    window.addEventListener('click', this.selectPerson);

    this.interactionEnabled = true;
  }

  disableInteraction() {
    window.removeEventListener('pointermove', this.hover);
    window.removeEventListener('click', this.selectPerson);

    this.interactionEnabled = false;
  }

  update(dt: number) {
    if (!this.animateInComplete) return;

    if (this.interactionEnabled) {
      // Mouse based camera offset
      const targetX = this.cameraBasePosition.x + this.mouse.x;
      const targetY = this.cameraBasePosition.y + this.mouse.y;

      this.camera.position.x += (targetX - this.camera.position.x) * 0.025;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.025;

      this.camera.lookAt(0, 0, 0);

      this.raycast();
    }
  }

  exit(): Promise<void> {
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
  }
}
