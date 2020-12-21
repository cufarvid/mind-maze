import Application from './engine/Application';
import Renderer from './engine/Renderer';
import * as dat from 'dat.gui';
import LevelManager from './engine/LevelManager';

class App extends Application {
  private loading = true;
  private renderer: Renderer;
  private time: number = Date.now();
  private startTime: number = Date.now();
  private aspect = 1;

  private levels: LevelManager;

  private pointerLockChangeHandler: EventListener;

  protected start(): void {
    this.renderer = new Renderer(this.gl);

    this.pointerLockChangeHandler = () => this.pointerLockChange();
    document.addEventListener(
      'pointerlockchange',
      this.pointerLockChangeHandler,
    );

    this.levels = new LevelManager([
      './assets/scenes/maze-01.json',
      './assets/scenes/maze-02.json',
    ]);

    void this.init();
  }

  private async init(): Promise<void> {
    await this.levels.init();
    this.rendererPrepare();
  }

  private async nextLevel(): Promise<void> {
    this.loading = true;
    await this.levels.next();
    this.rendererPrepare();
  }

  private rotate(): void {
    this.levels.current.nextStage();
  }

  private rendererPrepare(): void {
    this.renderer.prepare(this.levels.current.scene);
    this.loading = false;
  }

  protected enableCamera(): void {
    this.canvas.requestPointerLock();
  }

  protected pointerLockChange(): void {
    if (!this.levels.current.camera) return;

    if (document.pointerLockElement === this.canvas)
      this.levels.current.camera.enable();
    else this.levels.current.camera.disable();
  }

  protected update(): void {
    this.time = Date.now();
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.levels.current.camera) this.levels.current.camera.update(dt);

    if (this.levels.current.physics) this.levels.current.physics.update(dt);
  }

  protected render(): void {
    if (this.levels.current.scene)
      this.renderer.render(
        this.levels.current.scene,
        this.levels.current.camera,
      );
  }

  protected resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.aspect = w / h;
    if (this.levels.current.camera) {
      this.levels.current.camera.aspect = this.aspect;
      this.levels.current.camera.updateProjection();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  const app = new App(canvas);
  const gui = new dat.GUI();
  gui.add(app, 'enableCamera');
  gui.add(app, 'nextLevel');
  gui.add(app, 'rotate');
});
