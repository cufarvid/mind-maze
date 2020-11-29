import { IEntityOptions, ISceneOptions } from '../types';
import Scene from './Scene';
import Entity from './Entity';
import Mesh from './Mesh';
import Model from './Model';
import Camera from './Camera';

export default class SceneBuilder {
  private sceneOptions: ISceneOptions;

  public constructor(sceneOptions: ISceneOptions) {
    this.sceneOptions = sceneOptions;
  }

  private createEntity(entitySpec: IEntityOptions): Entity {
    switch (entitySpec.type) {
      case 'camera':
        return new Camera(entitySpec);
      case 'model': {
        const mesh = new Mesh(this.sceneOptions.meshes[entitySpec.mesh]);
        const texture = this.sceneOptions.textures[entitySpec.texture];
        return new Model(mesh, texture, entitySpec);
      }
    }
  }

  public build(): Scene {
    const scene = new Scene();
    this.sceneOptions.entities.forEach((spec) =>
      scene.addEntity(this.createEntity(spec)),
    );

    return scene;
  }
}
