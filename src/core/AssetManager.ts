import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class AssetManager {
  private textureLoader = new THREE.TextureLoader();
  // private gltfLoader = new GLTFLoader();

  textures = new Map<string, THREE.Texture>();
  // models = new Map<string, THREE.Group>();

  async loadTexture(name: string, url: string, pixelated: boolean = false) {
    if (this.textures.has(name)) return this.textures.get(name)!;

    const texture = await this.textureLoader.loadAsync(url);

    if (pixelated) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.anisotropy = 1;
    }

    this.textures.set(name, texture);
    console.log('Texture loaded: ', name);
    
    return texture;
  }

  // async loadGLTF(name: string, url: string) {
  //   if (this.models.has(name)) return this.models.get(name)!;

  //   const gltf = await this.gltfLoader.loadAsync(url);
  //   this.models.set(name, gltf.scene);
  //   return gltf.scene;
  // }
}

export const Assets = new AssetManager();
