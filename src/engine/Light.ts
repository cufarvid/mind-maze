import { vec3 } from 'gl-matrix';
import Entity from './Entity';
import { IEntityOptions } from '../types';

export default class Light extends Entity {
  public ambientColor: vec3 = [51, 51, 51];
  public diffuseColor: vec3 = [0, 0, 0];
  public specularColor: vec3 = [0, 0, 0];
  public shininess = 10;
  public attenuation: vec3 = [1.0, 0, 0.02];

  public constructor(options: IEntityOptions) {
    super(options);
    this.translation = [0, 5, 0];
  }
}
