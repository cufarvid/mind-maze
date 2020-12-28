import { TraverseParams } from '../types';
import Entity from './Entity';

export default class Scene {
  public entities: Array<Entity> = [];

  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  public traverse({ before, after }: TraverseParams): void {
    this.entities.forEach((entity) => entity.traverse(before, after));
  }
}
