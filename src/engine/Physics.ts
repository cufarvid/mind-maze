import { mat4, vec3 } from 'gl-matrix';
import Entity from './Entity';
import Scene from './Scene';
import LocateModel from './LocateModel';
import { AABB } from '../types';

export default class Physics {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  update(dt: number): void {
    this.scene.traverse({
      before: (entity: Entity) => {
        if (entity.velocity) {
          vec3.scaleAndAdd(
            entity.translation,
            entity.translation,
            entity.velocity,
            dt,
          );
          entity.updateTransform();
          this.scene.traverse({
            before: (other: Entity) => {
              if (entity !== other) {
                this.resolveCollision(entity, other);
              }
            },
            after: null,
          });
        }
      },
      after: null,
    });
  }

  intervalIntersection(
    min1: number,
    max1: number,
    min2: number,
    max2: number,
  ): boolean {
    return !(min1 > max2 || min2 > max1);
  }

  aabbIntersection(aabb1: AABB, aabb2: AABB): boolean {
    return (
      this.intervalIntersection(
        aabb1.min[0],
        aabb1.max[0],
        aabb2.min[0],
        aabb2.max[0],
      ) &&
      this.intervalIntersection(
        aabb1.min[1],
        aabb1.max[1],
        aabb2.min[1],
        aabb2.max[1],
      ) &&
      this.intervalIntersection(
        aabb1.min[2],
        aabb1.max[2],
        aabb2.min[2],
        aabb2.max[2],
      )
    );
  }

  resolveCollision(a: Entity, b: Entity): void {
    const tA: mat4 = a.getGlobalTransform();
    const tB: mat4 = b.getGlobalTransform();

    const posA = mat4.getTranslation(vec3.create(), tA);
    const posB = mat4.getTranslation(vec3.create(), tB);

    const minA = vec3.add(vec3.create(), posA, a.aabb.min);
    const maxA = vec3.add(vec3.create(), posA, a.aabb.max);
    const minB = vec3.add(vec3.create(), posB, b.aabb.min);
    const maxB = vec3.add(vec3.create(), posB, b.aabb.max);

    // Check if there is collision
    const isColliding = this.aabbIntersection(
      {
        min: minA,
        max: maxA,
      },
      {
        min: minB,
        max: maxB,
      },
    );

    if (!isColliding) return;
    else if (b instanceof LocateModel && !b.isLocated) {
      b.setLocated();
      console.log(a, b);
    }

    // Move node A minimally to avoid collision
    const diffA: vec3 = vec3.sub(vec3.create(), maxB, minA);
    const diffB: vec3 = vec3.sub(vec3.create(), maxA, minB);

    let minDiff = Infinity;
    let minDirection: vec3 = [0, 0, 0];
    if (diffA[0] >= 0 && diffA[0] < minDiff) {
      minDiff = diffA[0];
      minDirection = [minDiff, 0, 0];
    }
    if (diffA[1] >= 0 && diffA[1] < minDiff) {
      minDiff = diffA[1];
      minDirection = [0, minDiff, 0];
    }
    if (diffA[2] >= 0 && diffA[2] < minDiff) {
      minDiff = diffA[2];
      minDirection = [0, 0, minDiff];
    }
    if (diffB[0] >= 0 && diffB[0] < minDiff) {
      minDiff = diffB[0];
      minDirection = [-minDiff, 0, 0];
    }
    if (diffB[1] >= 0 && diffB[1] < minDiff) {
      minDiff = diffB[1];
      minDirection = [0, -minDiff, 0];
    }
    if (diffB[2] >= 0 && diffB[2] < minDiff) {
      minDiff = diffB[2];
      minDirection = [0, 0, -minDiff];
    }

    vec3.add(a.translation, a.translation, minDirection);

    a.updateTransform();
  }
}
