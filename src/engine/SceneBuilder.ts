import { IEntityOptions, ISceneOptions } from '../types';
import Scene from './Scene';
import Entity from './Entity';
import Mesh from './Mesh';
import Model from './Model';
import Camera from './Camera';
import Floor from './Floor';

export default class SceneBuilder {
  private sceneOptions: ISceneOptions;

  public constructor(sceneOptions: ISceneOptions) {
    this.sceneOptions = sceneOptions;
  }

  private createEntity(entityOptions: IEntityOptions): Entity {
    switch (entityOptions.type) {
      case 'camera':
        return new Camera(entityOptions);
      case 'model': {
        const mesh = new Mesh(this.sceneOptions.meshes[entityOptions.mesh]);
        const texture = this.sceneOptions.textures[entityOptions.texture];
        return new Model(mesh, texture, entityOptions);
      }
      case 'floor': {
        const texture = this.sceneOptions.textures[entityOptions.texture];
        return new Floor(texture, entityOptions);
      }
    }
  }

  public build(): Scene {
    const scene = new Scene();
    this.sceneOptions.entities.forEach((option) =>
      scene.addEntity(this.createEntity(option)),
    );

    return scene;
  }
}
