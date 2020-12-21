import Model from './Model';
import Mesh from './Mesh';
import { IEntityOptions } from '../types';
import Maze from './Maze';

export default class PickUpModel extends Model {
  private readonly id: number;

  constructor(
    id: number,
    mesh: Mesh,
    image: HTMLImageElement,
    options: IEntityOptions,
  ) {
    super(mesh, image, options);
    this.id = id;
  }

  public pickUp(): void {
    const parent = this.getParent;
    if (parent instanceof Maze && !parent.mInspection) {
      if (
        parent.mPickUp ||
        (parent.mPickUpInOrder && parent.nextObject.id == this.id)
      ) {
        parent.setObjectLocated(this.id);
        parent.removeChild(this);
      }
    }
  }
}
