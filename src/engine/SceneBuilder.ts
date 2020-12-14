import { IEntityOptions, IMazeBlockData, ISceneOptions } from '../types';
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
      case 'model': {
        const mesh = this.getMesh(options.mesh);
        const texture = this.getTexture(options.texture);
        return new Model(mesh, texture, options);
      }
      case 'floor': {
        const texture = this.getTexture(options.texture);
        return new Floor(texture, options);
      }
      case 'light':
        return new Light(options);
      case 'maze': {
        const mazeOptions: IMazeBlockData = {
          wall: {
            mesh: this.getMesh(options.blocks.wall.mesh),
            image: this.getTexture(options.blocks.wall.texture),
          },
          holder: {
            mesh: this.getMesh(options.blocks.holder.mesh),
            image: this.getTexture(options.blocks.holder.texture),
          },
        };

        return new Maze(options, mazeOptions);
      }
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
