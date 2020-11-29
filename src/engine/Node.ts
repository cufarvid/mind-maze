import { mat4 } from 'gl-matrix';
import { ITraverseFunction } from '../types';

export default class Node {
  private transform: mat4 = mat4.create();
  private readonly children: Array<Node> = [];
  private parent: Node = null;

  private getGlobalTransform(): mat4 {
    if (!this.parent) return mat4.clone(this.transform);
    else {
      const transform: mat4 = this.parent.getGlobalTransform();
      return mat4.mul(transform, transform, this.transform);
    }
  }

  public addChild(node: Node): void {
    this.children.push(node);
    node.parent = this;
  }

  public removeChild(node: Node): void {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      this.children.splice(index, 1);
      node.parent = null;
    }
  }

  public traverse(before: ITraverseFunction, after: ITraverseFunction): void {
    before(this);

    for (const child of this.children) {
      child.traverse(before, after);
    }

    after(this);
  }
}
