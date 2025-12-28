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

  startJiggle(object);

  function step() {
    const targetX = origin.x + THREE.MathUtils.randFloatSpread(range * 2);
    const targetY = options.allowY ? origin.y + THREE.MathUtils.randFloatSpread(range * 2) : origin.y;
    const targetZ = origin.z + THREE.MathUtils.randFloatSpread(range * 2);

    const duration = THREE.MathUtils.randFloat(durationMin, durationMax);

    object.userData.walkTween = gsap.to(object.position, {
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

export function stopRandomWalk(object: THREE.Object3D) {
  const tween = object.userData.walkTween;

  if (tween) {
    tween.kill();
    object.userData.walkTween = null;
    stopJiggle(object);
  }
}

function startJiggle(object: THREE.Object3D) {
  if (object.userData.jiggleTl) return;

  const baseAmp = THREE.MathUtils.randFloat(0.03, 0.07);
  const phase = Math.random();

  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    delay: phase * 0.4, // Phase offset
  });

  tl.to(object.rotation, {
    z: baseAmp,
    duration: 0.25,
    ease: 'sine.inOut',
  }).to(object.rotation, {
    z: -baseAmp,
    duration: 0.25,
    ease: 'sine.inOut',
  });

  object.userData.jiggleTl = tl;
}

function stopJiggle(object: THREE.Object3D) {
  const tl = object.userData.jiggleTl;
  if (tl) {
    tl.kill();
    object.rotation.z = 0;
    object.userData.jiggleTl = null;
  }
}