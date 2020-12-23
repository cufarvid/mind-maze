import UIElement from './UIElement';
import { IMazeObject, IMenuOptions } from '../types';
import { MENU_START, UI_DATA } from './constants';

export default class UIManager {
  static menu: UIElement;
  static loading: UIElement;
  static timer: UIElement;
  static objectBox: UIElement;

  public static init(): void {
    customElements.define('ui-element', UIElement);

    this.menu = UIManager.makeMenu(MENU_START);
    this.loading = UIManager.element(UI_DATA.loading, 'loading');
    this.timer = UIManager.makeTimer('00:00');
    this.objectBox = UIManager.makeObjectBox([]);

    UIManager.injectMultiple([
      this.menu,
      this.loading,
      this.timer,
      this.objectBox,
    ]);
  }

  private static element(
    text: string,
    className: string,
    show = true,
  ): UIElement {
    const element = new UIElement();

    element.className = className;
    element.appendChild(document.createTextNode(text));

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
      box.appendChild(
        UIManager.element(
          object.name,
          object.located ? 'object-located' : 'object',
        ),
      );
    });

    return box;
  }

  public static updateObjectBox(objects: Array<IMazeObject>): void {
    const newBox = UIManager.makeObjectBox(objects);
    UIManager.replace(UIManager.objectBox, newBox);
    UIManager.objectBox = newBox;
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
