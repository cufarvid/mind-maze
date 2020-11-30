import { TraverseParams } from '../types';
import Camera from './Camera';
import Entity from './Entity';
import Model from './Model';

export default class Scene {
  public entities: Array<Entity | Camera | Model> = [];

  public addEntity(entity: Entity | Camera | Model): void {
    this.entities.push(entity);
  }

  public traverse({ before, after }: TraverseParams): void {
    this.entities.forEach((entity) => entity.traverse(before, after));
  }
}
