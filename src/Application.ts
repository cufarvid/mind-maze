export default class Application {
  gl: WebGL2RenderingContext = null;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this._initGL();
    this.start();

    requestAnimationFrame(this._update.bind(this));
  }

  _initGL(): void {
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

  _update(): void {
    this._resize();
    this.update();
    this.render();

    requestAnimationFrame(this._update.bind(this));
  }

  _resize(): void {
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

  start(): void {
    // initialization
  }

  update(): void {
    // update
  }

  render(): void {
    // render
  }

  resize(): void {
    // resize
  }
}
