import gsap from 'gsap';

export function tweenToPromise(target: gsap.TweenTarget, vars: gsap.TweenVars) {
  return new Promise<void>((resolve) => {
    gsap.to(target, {
      ...vars,
      onComplete: () => {
        vars.onComplete?.();
        resolve();
      }
    });
  });
}

export function timelineToPromise(tl: gsap.core.Timeline): Promise<void> {
  return new Promise((resolve) => {
    tl.eventCallback('onComplete', () => resolve());
  });
}