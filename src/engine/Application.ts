export default class Application {
  protected gl: WebGL2RenderingContext = null;
  protected readonly canvas: HTMLCanvasElement;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
    this.start();

    requestAnimationFrame(this._update.bind(this));
  }

  private init(): void {
    try {
      this.gl = this.canvas.getContext('webgl2', {
        preserveDrawingBuffer: true,
      });
    } catch (e) {
      console.error(e);
    }

    if (!this.gl) {
      console.log('Cannot create WebGL 2.0 context');
    }
  }

  private _update(): void {
    this._resize();
    this.update();
    this.render();

    requestAnimationFrame(this._update.bind(this));
  }

  private _resize(): void {
    const canvas = this.canvas;
    const gl = this.gl;

    if (
      canvas.width !== canvas.clientWidth ||
      canvas.height !== canvas.clientHeight
    ) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      this.resize();
    }
  }

  protected start(): void {
    // initialization
  }

  protected update(): void {
    // update
  }

  protected render(): void {
    // render
  }

  protected resize(): void {
    // resize
  }
}
