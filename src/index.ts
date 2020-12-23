import Application from './engine/Application';
import Renderer from './engine/Renderer';
import LevelManager from './utils/LevelManager';
import UIManager from './utils/UIManager';

enum AppMode {
  Idle,
  Started,
  Paused,
}

class App extends Application {
  private mode = AppMode.Idle;
  private renderer: Renderer;
  private time: number = Date.now();
  private startTime: number = Date.now();
  private aspect = 1;

  private levels: LevelManager;

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
    UIManager.menu.hide();
    await this.levels.init();
    this.resize();
    this.rendererPrepare();
  }

  private initUI(): void {
    UIManager.init();

    const menuOptions = {
      title: 'Hello',
      info:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eu nibh id nisi tincidunt aliquam.',
      buttons: [
        {
          text: 'Start',
          callback: () => this.play(),
        },
        { text: 'Info', callback: () => console.log('Info') },
      ],
    };
    UIManager.updateMenu(menuOptions);

    this.pointerLockChangeHandler = () => this.pointerLockChange();
    document.addEventListener(
      'pointerlockchange',
      this.pointerLockChangeHandler,
    );

    document.addEventListener('keydown', (event) => {
      if (this.mode === AppMode.Started && event.key === 'p') this.pause();
    });
  }

  private play(): void {
    this.enableCamera();
    this.levels.current.timer.setElement(UIManager.timer);

    switch (this.mode) {
      case AppMode.Idle:
        this.levels.current.play();
        break;
      case AppMode.Paused:
        this.levels.current.resume();
        break;
    }

    UIManager.showGameRow();
    UIManager.menu.hide();
    this.mode = AppMode.Started;
  }

  private pause(): void {
    this.disableCamera();
    this.levels.current.pause();
    UIManager.hideGameRow();
    UIManager.menu.show();
    this.mode = AppMode.Paused;
  }

  private nextMode(): void {
    this.levels.current.nextMode();
    this.disableCamera();

    const title = this.levels.current.lastMode
      ? `Congratulations! Level #${this.levels.current.number} successfully completed.`
      : `Congratulations! Previous mode completed in ${this.levels.current.timer.timeDiff}s.`;

    const info = this.levels.current.lastMode
      ? ``
      : `${this.levels.current.mazeMode} mode is ahead of you!`;

    const last = this.levels.current.lastMode && this.levels.isLastLevel;

    const menuOptions = {
      title,
      info,
      buttons: [
        {
          text: 'Continue',
          callback: () => (!last ? this.play() : console.log('Last!')),
        },
        { text: 'Reset', callback: () => console.log('Reset') },
      ],
    };
    UIManager.updateMenu(menuOptions);
    UIManager.hideGameRow();

    this.mode = AppMode.Idle;
  }

  private nextLevel(): void {
    void this.loadNextLevel();
    this.disableCamera();

    const menuOptions = {
      title: `Congratulations! Start with level #${this.levels.current.number}.`,
      buttons: [
        {
          text: 'Start',
          callback: () => this.play(),
        },
        { text: 'Reset', callback: () => console.log('Reset') },
      ],
    };
    UIManager.updateMenu(menuOptions);
    UIManager.hideGameRow();

    this.mode = AppMode.Idle;
  }

  private async loadNextLevel(): Promise<void> {
    UIManager.menu.hide();
    UIManager.loading.show();
    await this.levels.next();
    this.rendererPrepare();
  }

  private rendererPrepare(): void {
    this.renderer.prepare(this.levels.current.scene);
    UIManager.loading.hide();
    UIManager.menu.show();
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

    if (this.mode == AppMode.Started) {
      if (!this.levels.current.completed && !this.levels.current.timerRunning) {
        this.nextMode();
      } else if (this.levels.current.completed) {
        this.nextLevel();
      } else if (this.levels.current.checkCompleted()) {
        this.nextMode();
      }
    }
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
