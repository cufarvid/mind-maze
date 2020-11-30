import Entity from './Entity';
import { ITraverseFunction } from '../types';
import Camera from './Camera';
import Model from './Model';

export default class Scene {
  public entities: Array<Entity> = [];

  public addEntity(entity: Entity | Camera | Model): void {
    this.entities.push(entity);
  }

  public traverse(before: ITraverseFunction, after: ITraverseFunction): void {
    this.entities.forEach((entity) => entity.traverse(before, after));
  }
}
