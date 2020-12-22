import { vec3, mat4, quat } from 'gl-matrix';
import Utils from '../utils/Utils';
import {
  AABB,
  IEntityGlProps,
  IEntityOptions,
  ITraverseFunction,
} from '../types';
import Camera from './Camera';
import Mesh from './Mesh';
import Model from './Model';

export default class Entity {
  private children: Array<Entity | Camera | Model> = [];
  private parent: Entity = null;

  public transform: mat4 = mat4.create();
  public velocity: vec3;
  public translation: vec3;
  public rotation: vec3;
  public scale: vec3;
  public aabb: AABB;

  public mesh?: Mesh;
  public image?: HTMLImageElement;
  public props?: IEntityGlProps;

  public constructor(options: IEntityOptions) {
    Utils.init(this, defaults, options);
    this.updateTransform();
  }

  public get getParent(): Entity {
    return this.parent;
  }

  public updateTransform(): void {
    const t = this.transform;
    const degrees = this.rotation.map((x: number) => (x * 180) / Math.PI);
    const q = quat.fromEuler(quat.create(), degrees[0], degrees[1], degrees[2]);
    const v = vec3.clone(this.translation);
    const s = vec3.clone(this.scale);
    mat4.fromRotationTranslationScale(t, q, v, s);
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
    before && before(this);

    for (const child of this.children) {
      child.traverse(before, after);
    }

    after && after(this);
  }
}

const defaults: IEntityOptions = {
  translation: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  aabb: {
    min: [0, 0, 0],
    max: [0, 0, 0],
  },
};
