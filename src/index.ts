import Application from './engine/Application';
import Renderer from './engine/Renderer';
import LevelManager from './utils/LevelManager';
import UIManager from './utils/UIManager';
import UIElement from './utils/UIElement';

class App extends Application {
  private started = false;
  private renderer: Renderer;
  private time: number = Date.now();
  private startTime: number = Date.now();
  private aspect = 1;

  private levels: LevelManager;

  private loading: UIElement;
  private menu: UIElement;
  private timer: UIElement;

  private pointerLockChangeHandler: EventListener;

  protected start(): void {
    this.initUI();
    this.renderer = new Renderer(this.gl);

    this.levels = new LevelManager([
      './assets/scenes/maze-01.json',
      './assets/scenes/maze-02.json',
    ]);

    void this.init();
  }

  private async init(): Promise<void> {
    await this.levels.init();
    this.resize();
    this.rendererPrepare();
  }

  private initUI(): void {
    UIManager.init();

    const menuOptions = [
      {
        text: 'Start',
        callback: () => this.play(),
      },
      { text: 'Info', callback: () => console.log('Info') },
    ];
    this.menu = UIManager.menu(menuOptions);
    this.loading = UIManager.loadingScreen();
    this.timer = UIManager.timer('00:00');

    UIManager.injectMultiple([this.menu, this.loading, this.timer]);

    this.pointerLockChangeHandler = () => this.pointerLockChange();
    document.addEventListener(
      'pointerlockchange',
      this.pointerLockChangeHandler,
    );

    document.addEventListener('keydown', (event) => {
      if (this.started && event.key === 'p') this.pause();
    });
  }

  private play(): void {
    this.started = true;
    this.enableCamera();
    this.levels.current.play();
    this.menu.hide();
    this.timer.show();
  }

  private pause(): void {
    this.started = false;
    this.disableCamera();
    this.levels.current.pause();
    this.menu.show();
  }

  private async nextLevel(): Promise<void> {
    this.loading.show();
    await this.levels.next();
    this.rendererPrepare();
  }

  private rendererPrepare(): void {
    this.renderer.prepare(this.levels.current.scene);
    this.loading.hide();
  }

  protected enableCamera(): void {
    this.canvas.requestPointerLock();
  }

  protected disableCamera(): void {
    document.exitPointerLock();
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

    // if (!this.levels.current.completed && this.levels.current.timer) {
    //   if (!this.levels.current.timerRunning) this.levels.current.nextMode();
    // }
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
  new App(canvas);
});
