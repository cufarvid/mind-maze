import { vec3 } from 'gl-matrix';
import Entity from './Entity';
import { IEntityOptions } from '../types';

export default class Light extends Entity {
  public ambientColor: vec3 = [50.0, 50.0, 50.0];
  public diffuseColor: vec3 = [200.0, 200.0, 200.0];
  public specularColor: vec3 = [255.0, 255.0, 255.0];
  public shininess = 10.0;
  public attenuation: vec3 = [1.0, 0, 0.02];

  public constructor(options: IEntityOptions) {
    super(options);
    this.translation = options.translation;
  }
}
