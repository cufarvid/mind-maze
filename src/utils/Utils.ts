import { clone } from 'lodash';
import Entity from '../engine/Entity';
import Camera from '../engine/Camera';
import Model from '../engine/Model';
import { IEntityOptions } from '../types';

export default class Utils {
  static init(
    object: Entity | Camera | Model,
    defaults: IEntityOptions,
    options: IEntityOptions,
  ): void {
    Object.assign(object, clone(defaults || {}), clone(options || {}));
  }
}
