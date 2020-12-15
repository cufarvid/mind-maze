import Model from './Model';
import Mesh from './Mesh';
import { IEntityOptions } from '../types';
import Maze from './Maze';

export default class LocateModel extends Model {
  private readonly id: number;
  private located = false;

  constructor(
    id: number,
    mesh: Mesh,
    image: HTMLImageElement,
    options: IEntityOptions,
  ) {
    super(mesh, image, options);
    this.id = id;
  }

  public get isLocated(): boolean {
    return this.located;
  }

  public setLocated(): void {
    this.located = true;
    const parent = this.getParent;
    if (parent instanceof Maze) parent.setObjectLocated(this.id);
  }
}
