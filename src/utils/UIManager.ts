import UIElement from './UIElement';
import { IMazeObject, IMenuOptions, IScoreData, IScores } from '../types';
import { OBJECT_SVG, SCREEN_WELCOME, TitleText } from './constants';

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

    this.loading = this.element(TitleText.Loading, 'loading');
    this.welcome = this.makeWelcomeScreen(SCREEN_WELCOME);
    this.timer = this.makeTimer('00:00');
    this.scoreBoard = this.makeScoreBoard({}, []);

    this.injectMultiple([
      this.loading,
      this.welcome,
      this.timer,
      this.fullscreenBtn,
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

    this.appendOptions(menu, options);

    return menu;
  }

  public static updateMenu(options: IMenuOptions): void {
    const newMenu = this.makeMenu(options);
    this.replace(this.menu, newMenu);
    this.menu = newMenu;
  }

  public static makeTimer(value: string): UIElement {
    return this.element(value, 'timer', false);
  }

  public static makeObjectBox(objects: Array<IMazeObject>): UIElement {
    const box = new UIElement();
    box.className = 'objects';

    objects.forEach((object) => {
      const element = this.element(
        null,
        object.located ? 'object-located' : 'object',
      );
      element.innerHTML = OBJECT_SVG[object.name];
      box.appendChild(element);
    });

    return box;
  }

  public static updateObjectBox(objects: Array<IMazeObject>): void {
    const newBox = this.makeObjectBox(objects);
    this.replace(this.objectBox, newBox);
    this.objectBox = newBox;
  }

  public static makeWelcomeScreen(options: IMenuOptions): UIElement {
    const screen = new UIElement();
    screen.className = 'welcome';

    if (options.title)
      screen.appendChild(this.element(options.title, 'welcome-title'));
    if (options.info)
      screen.appendChild(this.element(options.info, 'welcome-info'));

    this.appendOptions(screen, options);

    return screen;
  }

  private static appendOptions(parent: UIElement, options: IMenuOptions): void {
    if (options.html) parent.innerHTML += options.html;

    options.buttons.forEach((option) => {
      const button = document.createElement('button');
      button.appendChild(document.createTextNode(option.text));
      button.onclick = option.callback;
      parent.appendChild(button);
    });
  }

  public static updateWelcomeScreen(options: IMenuOptions): void {
    const newScreen = this.makeWelcomeScreen(options);
    this.replace(this.welcome, newScreen);
    this.welcome = newScreen;
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
    const newBoard = this.makeScoreBoard(data, scores);
    this.replace(this.scoreBoard, newBoard);
    this.scoreBoard = newBoard;
  }

  public static finalScoreBoard(
    data: Record<string, number>,
    scores: IScores,
  ): void {
    const newBoard = new UIElement();
    newBoard.className = 'scores';

    for (const level in scores) {
      newBoard.appendChild(
        this.makeScoreBoard(
          { number: Number(level), ...data },
          scores[level],
          true,
        ),
      );
    }
    this.replace(this.scoreBoard, newBoard);
    this.scoreBoard = newBoard;
  }

  public static updateAbout(options: IMenuOptions): void {
    const newInfo = this.makeMenu(options);
    this.replace(this.about, newInfo);
    this.about = newInfo;
  }

  public static inject(element: HTMLElement): void {
    const app: HTMLElement = document.getElementById('app');
    app.appendChild(element);
  }

  public static injectMultiple(elements: Array<HTMLElement>): void {
    elements.forEach((element) => this.inject(element));
  }

  public static replace(
    oldElement: HTMLElement,
    newElement: HTMLElement,
  ): void {
    if (oldElement) oldElement.remove();
    this.inject(newElement);
  }

  public static showGameRow(): void {
    this.objectBox.show();
    this.timer.show();
  }

  public static hideGameRow(): void {
    this.objectBox.hide();
    this.timer.hide();
  }
}
