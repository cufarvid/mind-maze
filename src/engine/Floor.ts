import { IEntityOptions } from '../types';
import Entity from './Entity';
import Mesh from './Mesh';

export default class Floor extends Entity {
  public constructor(image: HTMLImageElement, options: IEntityOptions) {
    super(null);
    this.image = image;
    this.mesh = Floor.generate(options.width, options.height);
  }

  private static generate(width = 10, height = 10, roughness = 0): Mesh {
    const vertices: Array<number> = [];
    const normals: Array<number> = [];
    const texcoords: Array<number> = [];

    for (let j = 0; j <= height; j++) {
      for (let i = 0; i <= width; i++) {
        const x = i - width / 2;
        const z = j - height / 2;
        const y = roughness <= 0 ? 0 : Math.random() / roughness;

        vertices.push(x);
        vertices.push(y);
        vertices.push(z);

        normals.push(0);
        normals.push(1);
        normals.push(0);

        texcoords.push(x);
        texcoords.push(z);
      }
    }

    const indices: Array<number> = [];
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        indices.push(i + j * (width + 1));
        indices.push(i + (j + 1) * (width + 1));
        indices.push(i + 1 + j * (width + 1));
        indices.push(i + 1 + j * (width + 1));
        indices.push(i + (j + 1) * (width + 1));
        indices.push(i + 1 + (j + 1) * (width + 1));
      }
    }

    return new Mesh({ vertices, indices, texcoords, normals });
  }
}
