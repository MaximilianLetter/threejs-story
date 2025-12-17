import gsap from 'gsap';

export function tweenToPromise(target: gsap.TweenTarget, vars: gsap.TweenVars) {
  return new Promise<void>((resolve) => {
    gsap.to(target, { ...vars, onComplete: resolve });
  });
}