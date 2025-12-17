import gsap from 'gsap';
import * as THREE from 'three';

interface WalkOptions {
  range?: number;        // max offset from origin
  durationMin?: number;  // minimum duration for each move
  durationMax?: number;  // maximum duration for each move
  allowY?: false;
}

/**
 * Makes an object randomly walk around
 * 
 * @param object Object to make wander around.
 * @param options Modify movement range, and duration until it selects a new goal.
 */
export function randomWalk(object: THREE.Object3D, options: WalkOptions = {}) {
  const range = options.range ?? 5;
  const durationMin = options.durationMin ?? 1;
  const durationMax = options.durationMax ?? 3;

  // store the original position as center
  const origin = object.position.clone();

  function step() {
    const targetX = origin.x + THREE.MathUtils.randFloatSpread(range * 2);
    const targetY = options.allowY ? origin.y + THREE.MathUtils.randFloatSpread(range * 2) : origin.y;
    const targetZ = origin.z + THREE.MathUtils.randFloatSpread(range * 2);

    const duration = THREE.MathUtils.randFloat(durationMin, durationMax);

    gsap.to(object.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration,
      ease: 'power1.inOut',
      onComplete: step,
    });
  }

  // Start the first step
  step();
}
