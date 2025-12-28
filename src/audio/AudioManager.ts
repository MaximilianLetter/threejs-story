import * as THREE from 'three';
import gsap from 'gsap';

export class AudioManager {
  listener: THREE.AudioListener;
  context: AudioContext;
  buffers = new Map<string, AudioBuffer>();

  masterVolume = 1;
  sfxVolume = 1;
  musicVolume = 0.7;

  private isMuted = false;
  private previousMasterVolume = 1;

  private ref: {
    music?: THREE.Audio,
    ambient?: THREE.Audio,
  } = {};

  // Required for animating volume
  private volumeProxy = {
    music: 1,
    ambient: 1,
  };

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.context = this.listener.context;

    this.addEventListeners();
  }

  setBuffer(id: string, buffer: AudioBuffer) {
    this.buffers.set(id, buffer);
  }

  play(id: string, options: {
    loop?: boolean;
    volume?: number;
    position?: THREE.Vector3;
    reference?: 'ambient' | 'music'
  } = {}) {
    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const sound = options.position
      ? new THREE.PositionalAudio(this.listener)
      : new THREE.Audio(this.listener);

    // NOTE: THREE.js does not hold value and does not return it correctly with getVolume()
    const initialVolume =
      (options.volume ?? 1) * this.sfxVolume * this.masterVolume;

    sound.setBuffer(buffer);
    sound.setVolume(initialVolume);
    sound.setLoop(!!options.loop);

    if (options.position) {
      const posSound = sound as THREE.PositionalAudio;
      posSound.position.copy(options.position);
      posSound.setRefDistance(2);
    } else if (options.reference) {
      if (options.reference === 'music') {
        this.ref.music = sound as THREE.Audio;
        this.volumeProxy.music = initialVolume;
      }

      if (options.reference === 'ambient') {
        this.ref.ambient = sound as THREE.Audio;
        this.volumeProxy.ambient = initialVolume;
      }
    }

    sound.play();
  }

  fadeVolume(ref: 'music' | 'ambient', duration: number, target: number) {
    let audio = ref === 'music' ? this.ref.music : this.ref.ambient;
    
    // Defensive return of no-op tween that does nothing
    if (!audio) return gsap.delayedCall(0, () => {});

    return gsap.to(this.volumeProxy, {
      [ref]: target,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        audio.setVolume(this.volumeProxy[ref]);
      },
      onComplete: () => {
        // Only stop audio if fades to zero
        if (target === 0) {
          audio.stop();
          if (ref === 'music') this.ref.music = undefined;
          if (ref === 'ambient') this.ref.ambient = undefined;
        }
      }
    })
  }

  muteAll() {
    if (this.isMuted) return;

    this.previousMasterVolume = this.masterVolume;
    this.masterVolume = 0;

    this.applyMasterVolume();
    this.isMuted = true;
  }

  unmuteAll() {
    if (!this.isMuted) return;

    this.masterVolume = this.previousMasterVolume;
    this.applyMasterVolume();
    this.isMuted = false;
  }

  private applyMasterVolume() {
    if (this.ref.music) {
      this.ref.music.setVolume(this.volumeProxy.music * this.masterVolume);
    }

    if (this.ref.ambient) {
      this.ref.ambient.setVolume(this.volumeProxy.ambient * this.masterVolume);
    }
  }

  addEventListeners() {
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.muteAll();
      } else {
        this.unmuteAll();
      }
    });

    window.addEventListener('blur', () => {
      this.muteAll();
    });

    window.addEventListener('focus', () => {
      this.unmuteAll();
    });

    console.log('Audio manager event listeners added.')
  }
}
