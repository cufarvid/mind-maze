import { IEntityOptions, ISceneOptions } from '../types';
import Scene from './Scene';
import Entity from './Entity';
import Mesh from './Mesh';
import Model from './Model';
import Camera from './Camera';
import Floor from './Floor';
import Light from './Light';
import Maze from './Maze';

export default class SceneBuilder {
  private sceneOptions: ISceneOptions;

  public constructor(sceneOptions: ISceneOptions) {
    this.sceneOptions = sceneOptions;
  }

  private createEntity(options: IEntityOptions): Entity {
    switch (options.type) {
      case 'camera':
        return new Camera(options);
      case 'floor':
        return new Floor(this.getTexture(options.texture), options);
      case 'light':
        return new Light(options);
      case 'model':
        return new Model(
          this.getMesh(options.mesh),
          this.getTexture(options.texture),
          options,
        );
      case 'maze':
        return new Maze(
          options,
          options.objects.map((obj) => ({
            name: obj.name,
            mesh: this.getMesh(obj.mesh),
            image: this.getTexture(obj.texture),
            location: obj.location,
          })),
        );
    }
  }

  private getMesh(index: number): Mesh {
    return new Mesh(this.sceneOptions.meshes[index]);
  }

  private getTexture(index: number): HTMLImageElement {
    return this.sceneOptions.textures[index];
  }

  public build(): Scene {
    const scene = new Scene();
    this.sceneOptions.entities.forEach((option) =>
      scene.addEntity(this.createEntity(option)),
    );

    return scene;
  }
}
