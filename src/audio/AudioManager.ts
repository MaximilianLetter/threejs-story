import * as THREE from 'three';

export class AudioManager {
  listener: THREE.AudioListener;
  context: AudioContext;
  buffers = new Map<string, AudioBuffer>();

  masterVolume = 1;
  sfxVolume = 1;
  musicVolume = 0.7;

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.context = this.listener.context;
  }

  setBuffer(id: string, buffer: AudioBuffer) {
    this.buffers.set(id, buffer);
  }

  play(id: string, options: {
    loop?: boolean;
    volume?: number;
    position?: THREE.Vector3;
  } = {}) {
    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const sound = options.position
      ? new THREE.PositionalAudio(this.listener)
      : new THREE.Audio(this.listener);

    sound.setBuffer(buffer);
    sound.setVolume((options.volume ?? 1) * this.sfxVolume * this.masterVolume);
    sound.setLoop(!!options.loop);

    if (options.position) {
      const posSound = sound as THREE.PositionalAudio;
      posSound.position.copy(options.position);
      posSound.setRefDistance(2);
    }

    sound.play();
  }
}
