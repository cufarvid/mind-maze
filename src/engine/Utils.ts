import { clone } from 'lodash';
import Entity from './Entity';
import Camera from './Camera';
import Model from './Model';
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
