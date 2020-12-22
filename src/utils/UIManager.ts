import UIElement from './UIElement';
import { IMenuOptions } from '../types';

export default class UIManager {
  public static init(): void {
    customElements.define('ui-element', UIElement);
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

  public static loadingScreen(text = 'Loading'): UIElement {
    return UIManager.element(text, 'loading');
  }

  public static timer(value: string): UIElement {
    return UIManager.element(value, 'timer', false);
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
