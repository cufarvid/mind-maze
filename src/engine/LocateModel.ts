import Model from './Model';
import Mesh from './Mesh';
import { IEntityOptions } from '../types';

export default class LocateModel extends Model {
  private located = false;

  constructor(mesh: Mesh, image: HTMLImageElement, options: IEntityOptions) {
    super(mesh, image, options);
  }

  public get isLocated(): boolean {
    return this.located;
  }

  public setLocated(): void {
    this.located = true;
  }
}
