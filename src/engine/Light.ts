import { vec3 } from 'gl-matrix';
import Entity from './Entity';
import { IEntityOptions } from '../types';

export default class Light extends Entity {
  public ambientColor: vec3 = [200, 200, 200];
  public diffuseColor: vec3 = [20, 20, 20];
  public specularColor: vec3 = [0, 0, 0];
  public shininess = 20;
  public attenuation: vec3 = [1.0, 0, 0.02];

  public constructor(options: IEntityOptions) {
    super(options);
    this.translation = options.translation;
  }
}
