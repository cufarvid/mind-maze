import { mat4, vec3 } from 'gl-matrix';
import Entity from './Entity';
import Scene from './Scene';
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
    const ta: mat4 = a.getGlobalTransform();
    const tb: mat4 = b.getGlobalTransform();

    const posa = mat4.getTranslation(vec3.create(), ta);
    const posb = mat4.getTranslation(vec3.create(), tb);

    const mina = vec3.add(vec3.create(), posa, a.aabb.min);
    const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
    const minb = vec3.add(vec3.create(), posb, b.aabb.min);
    const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

    // Check if there is collision.
    const isColliding = this.aabbIntersection(
      {
        min: mina,
        max: maxa,
      },
      {
        min: minb,
        max: maxb,
      },
    );

    if (!isColliding) {
      return;
    }

    // Move node A minimally to avoid collision.
    const diffa: vec3 = vec3.sub(vec3.create(), maxb, mina);
    const diffb: vec3 = vec3.sub(vec3.create(), maxa, minb);

    let minDiff = Infinity;
    let minDirection: vec3 = [0, 0, 0];
    if (diffa[0] >= 0 && diffa[0] < minDiff) {
      minDiff = diffa[0];
      minDirection = [minDiff, 0, 0];
    }
    if (diffa[1] >= 0 && diffa[1] < minDiff) {
      minDiff = diffa[1];
      minDirection = [0, minDiff, 0];
    }
    if (diffa[2] >= 0 && diffa[2] < minDiff) {
      minDiff = diffa[2];
      minDirection = [0, 0, minDiff];
    }
    if (diffb[0] >= 0 && diffb[0] < minDiff) {
      minDiff = diffb[0];
      minDirection = [-minDiff, 0, 0];
    }
    if (diffb[1] >= 0 && diffb[1] < minDiff) {
      minDiff = diffb[1];
      minDirection = [0, -minDiff, 0];
    }
    if (diffb[2] >= 0 && diffb[2] < minDiff) {
      minDiff = diffb[2];
      minDirection = [0, 0, -minDiff];
    }

    vec3.add(a.translation, a.translation, minDirection);

    a.updateTransform();
  }
}
