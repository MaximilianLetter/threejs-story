import gsap from "gsap";

export class TextManager {
  private textElement: {
    top: HTMLElement,
    center: HTMLElement,
    bottom: HTMLElement,
    flexible: HTMLElement
  };

  constructor() {
    this.textElement = {
      top: document.getElementById('textTop')!,
      center: document.getElementById('textCenter')!,
      bottom: document.getElementById('textBottom')!,
      flexible: document.getElementById('textBottom')!
    };
  }

  showText(pos: 'top' | 'center' | 'bottom', content: string, fadeIn = 1, hold = 2) {
    const el = this.textElement[pos];

    return gsap.timeline()
      .call(() => {
        el.hidden = false;
        el.textContent = content;
        el.style.opacity = '0';
      })
      // .fromTo(el, { opacity: 0 }, { opacity: 1, duration: fadeIn, immediateRender: false })
      .to(el, {
        opacity: 1, 
        duration: fadeIn,
        ease: 'power2.inOut'
      })
      .to({}, { duration: hold })
      .to(el, {
        opacity: 0,
        duration: fadeIn,
        ease: 'power2.inOut',
        onComplete: () => { el.hidden = true },
      });
  }

  hideText(pos: 'top' | 'center' | 'bottom', duration = 1) {
    const el = this.textElement[pos];

    return gsap.to(el, {
      opacity: 0,
      y: -10,
      duration: duration,
      ease: 'power2.inOut',
      onComplete: () => {
        el.hidden = true;
      }
    })
  }

}