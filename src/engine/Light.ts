import { vec3 } from 'gl-matrix';
import Utils from './Utils';
import { IEntityOptions } from '../types';
import Entity from './Entity';

export default class Light extends Entity {
  public shininess: number;
  public ambientColor: vec3;
  public diffuseColor: vec3;
  public specularColor: vec3;
  public attenuation: vec3;

  public constructor(options: IEntityOptions) {
    super(options);
    Utils.init(this, defaults, options);
  }
}

const defaults: IEntityOptions = {
  shininess: 10,
  ambientColor: [50, 50, 50],
  diffuseColor: [200, 200, 200],
  specularColor: [255, 255, 255],
  attenuation: [1, 0, 0.01],
  translation: [0, 5, 0],
};
