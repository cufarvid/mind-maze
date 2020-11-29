import Mesh from './Mesh';
import Entity from './Entity';
import { IEntityOptions } from '../types';

export default class Model extends Entity {
  public mesh: Mesh;
  public texture: HTMLImageElement;

  public constructor(
    mesh: Mesh,
    texture: HTMLImageElement,
    options: IEntityOptions,
  ) {
    super(options);
    this.texture = texture;
    this.mesh = mesh;
  }
}
