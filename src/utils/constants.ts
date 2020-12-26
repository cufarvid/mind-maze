import { IMenuOptions, IMenuPartial } from '../types';
import { Cone, Cube, Cylinder, Pyramid, Sphere, Torus } from '../assets/svg';

/*
 * Enums
 */

export enum MazeMode {
  Inspection,
  PickUp,
  PickUpInOrder,
}

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

export const MODE_TEXT: Record<
  number,
  { name: string; description: string }
> = {
  0: {
    name: 'Inspection',
    description: 'Locate all hidden objects and remember their locations.',
  },
  1: {
    name: 'Pick up',
    description: 'Pick up the objects you located in inspection mode.',
  },
  2: {
    name: 'Pick up in order',
    description:
      'Pick up the objects in specific order, it will be shown when you start.',
  },
};

export const MENU_DEFAULT: IMenuOptions = {
  title: TitleText.Start,
  info: '',
  buttons: [],
};

export const MENU_START: IMenuPartial = {
  title: TitleText.Start,
  info: `${MODE_TEXT[MazeMode.Inspection].name} mode: ${
    MODE_TEXT[MazeMode.Inspection].description
  }`,
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
