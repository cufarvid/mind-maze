import { IEntityOptions } from '../types';
import Entity from './Entity';
import Mesh from './Mesh';

export default class Model extends Entity {
  public image: HTMLImageElement;

  constructor(mesh: Mesh, image: HTMLImageElement, options: IEntityOptions) {
    super(options);
    this.mesh = mesh;
    this.image = image;
  }
}
