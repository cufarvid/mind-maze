import Entity from './Entity';
import { ITraverseFunction } from '../types';

export default class Scene {
  public entities: Array<Entity>;

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  public traverse(before: ITraverseFunction, after: ITraverseFunction): void {
    this.entities.forEach((entity) => entity.traverse(before, after));
  }
}
