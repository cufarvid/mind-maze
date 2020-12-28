import UIElement from './UIElement';
import { IMazeObject, IMenuOptions, IScoreData, IScores } from '../types';
import {
  MENU_DEFAULT,
  OBJECT_SVG,
  SCREEN_WELCOME,
  TitleText,
} from './constants';

export default class UIManager {
  static menu: UIElement;
  static loading: UIElement;
  static welcome: UIElement;
  static timer: UIElement;
  static objectBox: UIElement;
  static scoreBoard: UIElement;
  static about: UIElement;

  public static init(): void {
    customElements.define('ui-element', UIElement);

    this.menu = UIManager.makeMenu(MENU_DEFAULT);
    this.loading = UIManager.element(TitleText.Loading, 'loading');
    this.welcome = UIManager.makeWelcomeScreen(SCREEN_WELCOME);
    this.timer = UIManager.makeTimer('00:00');
    this.objectBox = UIManager.makeObjectBox([]);
    this.scoreBoard = UIManager.makeScoreBoard({}, []);
    this.about = UIManager.makeMenu(MENU_DEFAULT);

    this.scoreBoard.hide();

    UIManager.injectMultiple([
      this.menu,
      this.loading,
      this.welcome,
      this.timer,
      this.objectBox,
      this.scoreBoard,
    ]);
  }

  private static element(
    text: string,
    className: string,
    show = true,
  ): UIElement {
    const element = new UIElement();

    element.className = className;

    if (text) element.appendChild(document.createTextNode(text));
    if (!show) element.hide();

    return element;
  }

  public static makeMenu(options: IMenuOptions): UIElement {
    const menu = new UIElement();
    menu.className = 'menu';

    if (options.title)
      menu.appendChild(UIManager.element(options.title, 'menu-title'));
    if (options.info)
      menu.appendChild(UIManager.element(options.info, 'menu-info'));
    if (options.html) menu.innerHTML += options.html;

    options.buttons.forEach((option) => {
      const button = document.createElement('button');
      button.appendChild(document.createTextNode(option.text));
      button.onclick = option.callback;
      menu.appendChild(button);
    });

    return menu;
  }

  public static updateMenu(options: IMenuOptions): void {
    const newMenu = UIManager.makeMenu(options);
    UIManager.replace(UIManager.menu, newMenu);
    UIManager.menu = newMenu;
  }

  public static makeTimer(value: string): UIElement {
    return UIManager.element(value, 'timer', false);
  }

  public static makeObjectBox(objects: Array<IMazeObject>): UIElement {
    const box = new UIElement();
    box.className = 'objects';

    objects.forEach((object) => {
      const element = UIManager.element(
        null,
        object.located ? 'object-located' : 'object',
      );
      element.innerHTML = OBJECT_SVG[object.name];
      box.appendChild(element);
    });

    return box;
  }

  public static updateObjectBox(objects: Array<IMazeObject>): void {
    const newBox = UIManager.makeObjectBox(objects);
    UIManager.replace(UIManager.objectBox, newBox);
    UIManager.objectBox = newBox;
  }

  public static makeWelcomeScreen(options: IMenuOptions): UIElement {
    const screen = new UIElement();
    screen.className = 'welcome';

    if (options.title)
      screen.appendChild(UIManager.element(options.title, 'welcome-title'));
    if (options.info)
      screen.appendChild(UIManager.element(options.info, 'welcome-info'));

    options.buttons.forEach((option) => {
      const button = document.createElement('button');
      button.appendChild(document.createTextNode(option.text));
      button.onclick = option.callback;
      screen.appendChild(button);
    });

    return screen;
  }

  public static updateWelcomeScreen(options: IMenuOptions): void {
    const newScreen = UIManager.makeWelcomeScreen(options);
    UIManager.replace(UIManager.welcome, newScreen);
    UIManager.welcome = newScreen;
  }

  public static makeScoreBoard(
    data: Record<string, number>,
    scores: Array<IScoreData>,
    multiple = false,
  ): UIElement {
    const board = new UIElement();
    board.className = multiple ? 'score-board-multi' : 'score-board';

    const title = document.createElement('div');
    title.appendChild(
      document.createTextNode(`Level #${data.number} results:`),
    );

    const list = document.createElement('ol');

    scores.forEach((option) => {
      const row = document.createElement('li');
      row.appendChild(
        document.createTextNode(
          `Located ${option.objectsLocated}/${data.objectsTotal} objects in ${option.timeDiff}s`,
        ),
      );
      list.appendChild(row);
    });

    board.append(...[title, list]);

    return board;
  }

  public static updateScoreBoard(
    data: Record<string, number>,
    scores: Array<IScoreData>,
  ): void {
    const newBoard = UIManager.makeScoreBoard(data, scores);
    UIManager.replace(UIManager.scoreBoard, newBoard);
    UIManager.scoreBoard = newBoard;
  }

  public static finalScoreBoard(
    data: Record<string, number>,
    scores: IScores,
  ): void {
    const newBoard = new UIElement();
    newBoard.className = 'scores';

    for (const level in scores) {
      newBoard.appendChild(
        UIManager.makeScoreBoard(
          { number: Number(level), ...data },
          scores[level],
          true,
        ),
      );
    }
    UIManager.replace(UIManager.scoreBoard, newBoard);
    UIManager.scoreBoard = newBoard;
  }

  public static updateAbout(options: IMenuOptions): void {
    const newInfo = UIManager.makeMenu(options);
    UIManager.replace(UIManager.about, newInfo);
    UIManager.about = newInfo;
  }

  public static inject(element: HTMLElement): void {
    const app: HTMLElement = document.getElementById('app');
    app.appendChild(element);
  }

  public static injectMultiple(elements: Array<HTMLElement>): void {
    elements.forEach((element) => UIManager.inject(element));
  }

  public static replace(
    oldElement: HTMLElement,
    newElement: HTMLElement,
  ): void {
    oldElement.remove();
    UIManager.inject(newElement);
  }

  public static showGameRow(): void {
    UIManager.objectBox.show();
    UIManager.timer.show();
  }

  public static hideGameRow(): void {
    UIManager.objectBox.hide();
    UIManager.timer.hide();
  }
}
