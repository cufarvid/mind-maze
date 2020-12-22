export default class UIElement extends HTMLElement {
  private visible = true;

  public constructor() {
    super();
  }

  public toggle(): void {
    this.visible ? this.hide() : this.show();
  }

  public hide(): void {
    this.style.display = 'none';
    this.visible = false;
  }

  public show(): void {
    this.style.display = 'flex';
    this.visible = true;
  }
}
