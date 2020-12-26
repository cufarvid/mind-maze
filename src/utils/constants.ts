import { IMenuOptions, IMenuPartial } from '../types';
import { Cone, Cube, Cylinder, Pyramid, Sphere, Torus } from '../assets/svg';

/*
 * Enums
 */

export enum TitleText {
  Start = 'Time to get started!',
  Welcome = 'Welcome to Mind Maze',
  Pause = 'Game paused',
  Loading = 'Loading',
  Failed = 'You ran out of time!',
}

export enum InfoText {
  Start = '',
  Welcome = '',
  Pause = '',
}

export enum ButtonText {
  Start = 'Start',
  Reset = 'Reset',
  Resume = 'Resume',
  Restart = 'Restart',
  Continue = 'Continue',
  Info = 'Info',
}

/*
 * Constants
 */

export const MENU_DEFAULT: IMenuOptions = {
  title: TitleText.Start,
  info: '',
  buttons: [],
};

export const MENU_START: IMenuPartial = {
  title: TitleText.Start,
  okText: ButtonText.Start,
  cancelText: ButtonText.Reset,
};

export const MENU_PAUSE: IMenuPartial = {
  title: TitleText.Pause,
  okText: ButtonText.Resume,
  cancelText: ButtonText.Reset,
};

export const SCREEN_WELCOME: IMenuOptions = {
  title: 'Welcome',
  info: '',
  buttons: [],
};

export const OBJECT_SVG: Record<string, string> = {
  cone: Cone,
  cube: Cube,
  cylinder: Cylinder,
  pyramid: Pyramid,
  sphere: Sphere,
  torus: Torus,
};
