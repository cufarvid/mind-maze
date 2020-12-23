import UIElement from './UIElement';
import { IMazeObject, IMenuOptions } from '../types';

export default class UIManager {
  static men: UIElement;
  static loading: UIElement;

  public static init(): void {
    customElements.define('ui-element', UIElement);

    this.loading = UIManager.element('Loading', 'loading');
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

  public static menu(options: IMenuOptions): UIElement {
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

  public static timer(value: string): UIElement {
    return UIManager.element(value, 'timer', false);
  }

  public static objectBox(objects: Array<IMazeObject>): UIElement {
    const box = new UIElement();
    box.className = 'objects';

    objects.forEach((object) => {
      box.appendChild(UIManager.element(object.name, 'object'));
    });

    return box;
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
}
