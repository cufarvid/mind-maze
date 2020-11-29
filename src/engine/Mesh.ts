import { IMeshData } from '../types';

export default class Mesh implements IMeshData {
  public indices: Array<number>;
  public normals: Array<number>;
  public texcoords: Array<number>;
  public vertices: Array<number>;

  public constructor(options: IMeshData) {
    this.indices = options.indices;
    this.normals = options.normals;
    this.texcoords = options.texcoords;
    this.vertices = options.vertices;
  }
}
