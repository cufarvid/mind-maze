import { IMenuOptions, IMenuPartial } from '../types';

/*
 * Enums
 */

export enum TitleText {
  Start = 'Time to get started!',
  Welcome = 'Welcome to Mind Maze',
  Pause = 'Game paused',
  Loading = 'Loading',
}

export enum InfoText {
  Start = '',
  Welcome = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eu nibh id nisi tincidunt aliquam.',
  Pause = '',
}

export enum ButtonText {
  Start = 'Start',
  Reset = 'Reset',
  Resume = 'Resume',
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
