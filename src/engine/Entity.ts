import { mat4, quat, vec3 } from 'gl-matrix';
import { AABB, IEntityOptions, ITraverseFunction } from '../types';
import Model from './Model';
import Camera from './Camera';
import Mesh from './Mesh';

export default class Entity {
  public transform: mat4 = mat4.create();
  private readonly children: Array<Entity | Camera | Model> = [];
  private parent: Entity = null;

  protected translation: vec3 = [0, 0, 0];
  protected rotation: vec3 = [0, 0, 0];
  protected scale: vec3 = [0, 0, 0];
  protected aabb: AABB = {
    min: [0, 0, 0],
    max: [0, 0, 0],
  };

  public mesh?: Mesh;
  public texture?: HTMLImageElement;
  public gl?: Record<string, any>;

  public constructor(options: IEntityOptions) {
    this.setOptions(options);
    this.updateTransform();
  }

  public setOptions(options: IEntityOptions): void {
    this.translation = options.translation || this.translation;
    this.rotation = options.rotation || this.rotation;
    this.scale = options.scale || this.scale;
    this.aabb = options.aabb || this.aabb;
  }

  protected updateTransform(): void {
    const degrees = this.rotation.map((x: number) => (x * 100) / Math.PI);
    const q = quat.fromEuler(quat.create(), degrees[0], degrees[1], degrees[2]);
    const v = vec3.clone(this.translation);
    const s = vec3.clone(this.scale);
    mat4.fromRotationTranslationScale(this.transform, q, v, s);
  }

  public getGlobalTransform(): mat4 {
    if (!this.parent) return mat4.clone(this.transform);
    else {
      const transform: mat4 = this.parent.getGlobalTransform();
      return mat4.mul(transform, transform, this.transform);
    }
  }

  public addChild(entity: Entity | Camera | Model): void {
    this.children.push(entity);
    entity.parent = this;
  }

  public removeChild(entity: Entity | Camera | Model): void {
    const index = this.children.indexOf(entity);
    if (index >= 0) {
      this.children.splice(index, 1);
      entity.parent = null;
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
