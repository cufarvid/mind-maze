import Application from './engine/Application';
import Renderer from './engine/Renderer';
import LevelManager from './utils/LevelManager';
import UIManager from './utils/UIManager';
import {
  ButtonText,
  InfoText,
  MENU_PAUSE,
  MENU_START,
  TitleText,
} from './utils/constants';
import { IMenuPartial } from './types';
import { MazeMode } from './engine/Maze';

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

  /*
   * Initialization
   */

  private async init(): Promise<void> {
    UIManager.welcome.hide();
    UIManager.menu.hide();

    await this.levels.init();
    this.resize();
    this.rendererPrepare();

    UIManager.welcome.show();
  }

  private initUI(): void {
    UIManager.init();

    this.makeWelcomeScreen();
    this.setMenu(MENU_START);

    this.pointerLockChangeHandler = () => this.pointerLockChange();
    document.addEventListener(
      'pointerlockchange',
      this.pointerLockChangeHandler,
    );

    document.addEventListener('keydown', (event) => {
      if (this.mode === AppMode.Started && event.key === 'p') this.pause();
    });
  }

  private rendererPrepare(): void {
    this.renderer.prepare(this.levels.current.scene);
    UIManager.loading.hide();
  }

  /*
   * Loop & rendering
   */

  protected update(): void {
    if (this.mode == AppMode.Started) {
      this.time = Date.now();
      const dt = (this.time - this.startTime) * 0.001;
      this.startTime = this.time;

      if (this.levels.current.camera) this.levels.current.camera.update(dt);

      if (this.levels.current.physics) this.levels.current.physics.update(dt);

      if (!this.levels.current.completed && !this.levels.current.timerRunning) {
        this.nextMode(this.levels.current.mazeMode === MazeMode.Inspection);
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

  /*
   * Game control
   */

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
    this.setMenu(MENU_PAUSE);

    UIManager.hideGameRow();

    this.mode = AppMode.Paused;
  }

  private idle(): void {
    this.disableCamera();

    UIManager.menu.hide();
    UIManager.welcome.show();

    this.mode = AppMode.Idle;
  }

  private async reset(): Promise<void> {
    this.disableCamera();
    this.levels.reset();
    UIManager.menu.hide();
    UIManager.loading.show();

    await this.levels.init();
    this.resize();
    this.rendererPrepare();
    this.setMenu(MENU_START, false);

    UIManager.welcome.show();

    this.mode = AppMode.Idle;
  }

  private nextMode(success = true): void {
    this.levels.current.nextMode();
    this.disableCamera();
    this.setModeMenu(success);

    UIManager.hideGameRow();

    this.mode = AppMode.Idle;
  }

  private nextLevel(): void {
    void this.loadNextLevel();
    this.disableCamera();
    this.setLevelMenu();

    UIManager.hideGameRow();

    this.mode = AppMode.Idle;
  }

  private async loadNextLevel(): Promise<void> {
    UIManager.menu.hide();
    UIManager.loading.show();

    await this.levels.next();
    this.rendererPrepare();

    UIManager.menu.show();
  }

  /*
   * Camera
   */

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

  /*
   * User interface
   */

  private makeWelcomeScreen(): void {
    UIManager.updateWelcomeScreen({
      title: TitleText.Welcome,
      info: InfoText.Welcome,
      buttons: [
        {
          text: ButtonText.Start,
          callback: () => {
            UIManager.welcome.hide();
            UIManager.menu.show();
          },
        },
        { text: ButtonText.Info, callback: () => console.log('Info') },
      ],
    });
  }

  private setMenu(options: IMenuPartial, show = true): void {
    UIManager.updateMenu({
      title: options.title,
      info: '',
      buttons: [
        {
          text: options.okText,
          callback: () => this.play(),
        },
        { text: options.cancelText, callback: () => this.reset() },
      ],
    });

    if (!show) UIManager.menu.hide();
  }

  private setModeMenu(success: boolean): void {
    const { lastMode } = this.levels.current;
    const lastLevel = lastMode && this.levels.isLastLevel;
    let title: string;

    if (success) {
      title = lastMode
        ? `Congratulations! Level #${this.levels.current.number} successfully completed.`
        : `Congratulations! Previous mode completed in ${this.levels.current.timer.timeDiff} seconds.`;
    } else {
      title = TitleText.Failed;
    }

    const info = lastMode
      ? ``
      : `${this.levels.current.mazeMode} mode is ahead of you!`;

    const buttons = [
      {
        text: ButtonText.Continue,
        callback: () => (lastLevel ? this.idle() : this.play()),
      },
      { text: ButtonText.Resume, callback: () => this.reset() },
    ];

    UIManager.updateMenu({
      title,
      info,
      buttons,
    });
  }

  private setLevelMenu(): void {
    UIManager.updateMenu({
      title: `Congratulations! Start with level #${this.levels.current.number}.`,
      buttons: [
        {
          text: ButtonText.Start,
          callback: () => this.play(),
        },
        { text: ButtonText.Reset, callback: () => this.reset() },
      ],
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  new App(canvas);
});
