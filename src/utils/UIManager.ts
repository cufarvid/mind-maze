import UIElement from './UIElement';
import { IMenuItem } from '../types';

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

  public static menu(options: Array<IMenuItem>): UIElement {
    const menu = new UIElement();
    menu.className = 'menu';

    options.forEach((option) => {
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
}
