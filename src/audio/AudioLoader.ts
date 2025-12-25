import * as THREE from 'three';
import { AudioManager } from './AudioManager';
import { SoundIds } from './SoundIds';

export async function loadAudio(audioManager: AudioManager): Promise<void> {
  const loader = new THREE.AudioLoader();

  const sounds: [string, string][] = [
    [SoundIds.SELECT, '/audio/select.wav'],
    [SoundIds.SELECT_FAIL, '/audio/selectFail.wav'],
    [SoundIds.CROWD_AMBIENT, '/audio/crowd_mall_ambient.mp3'],
  ];

  return Promise.all(
    sounds.map(
      ([id, url]) =>
        new Promise<void>((resolve) => {
          loader.load(url, (buffer) => {
            audioManager.setBuffer(id, buffer);
            resolve();
          });
        })
    )
  ).then(() => {});
}
