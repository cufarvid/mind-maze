import Application from './engine/Application';
import Renderer from './engine/Renderer';
import LevelManager from './utils/LevelManager';
import UIManager from './utils/UIManager';
import {
  ButtonText,
  InfoText,
  MazeMode,
  MENU_PAUSE,
  MENU_START,
  MENU_SVG,
  MENU_HTML,
  MODE_TEXT,
  TitleText,
} from './constants';
import { IMenuItem, IMenuPartial } from './types';
import ScoreManager from './utils/ScoreManager';

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
  private fullscreen = false;

  private levels: LevelManager;

  private pointerLockChangeHandler: EventListener;

  protected start(): void {
    this.initUI();
    this.renderer = new Renderer(this.gl);

    this.levels = new LevelManager([
      './assets/scenes/maze-01-tex.json',
      './assets/scenes/maze-02-tex.json',
      './assets/scenes/maze-03-tex.json',
    ]);

    void this.init();
  }

  /*
   * Initialization
   */

  private async init(): Promise<void> {
    UIManager.hideMenu();

    await this.levels.init();
    this.resize();
    this.rendererPrepare();

    UIManager.showWelcome();
  }

  private initUI(): void {
    UIManager.init();

    this.makeWelcomeScreen();
    this.setMenu(MENU_START);
    this.setAboutMenu();
    this.setFullscreenButton();

    this.pointerLockChangeHandler = () => this.pointerLockChange();
    document.addEventListener(
      'pointerlockchange',
      this.pointerLockChangeHandler,
    );

    document.addEventListener('keydown', (event) => {
      if (this.mode === AppMode.Started && ['p', 'Escape'].includes(event.key))
        this.pause();
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
    this.time = Date.now();
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.levels.current.camera) this.levels.current.camera.update(dt);

    if (this.levels.current.physics) this.levels.current.physics.update(dt);

    if (this.mode == AppMode.Started) {
      if (!this.levels.current.completed && !this.levels.current.timerRunning) {
        const mode = this.levels.current.mazeMode;
        this.nextMode(mode, mode === MazeMode.Inspection);
      } else if (this.levels.current.completed) {
        this.nextLevel();
      } else if (this.levels.current.checkCompleted()) {
        this.nextMode(this.levels.current.mazeMode);
      }
    }
  }

  protected render(): void {
    if (this.mode === AppMode.Started && this.levels.current.scene)
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
    this.levels.current.timer.setElement(UIManager.newTimer());

    switch (this.mode) {
      case AppMode.Idle:
        this.levels.current.play();
        break;
      case AppMode.Paused:
        this.levels.current.resume();
        break;
    }

    UIManager.showGameRow();

    this.mode = AppMode.Started;
  }

  private pause(): void {
    this.disableCamera();
    this.levels.current.pause();
    this.setMenu(MENU_PAUSE);

    UIManager.hideGameRow();

    this.mode = AppMode.Paused;
  }

  private async reset(): Promise<void> {
    this.disableCamera();
    this.levels.reset();

    ScoreManager.reset();

    UIManager.showLoading();

    await this.levels.init();
    this.resize();
    this.rendererPrepare();
    this.setMenu(MENU_START, false);

    UIManager.showWelcome();

    this.mode = AppMode.Idle;
  }

  private nextMode(currentMode: MazeMode, success = true): void {
    if (currentMode !== MazeMode.Inspection) {
      const { objectsLocated, objectsTotal, timeDiff } = this.levels.current;

      ScoreManager.addScore(this.levels.current.number, {
        objectsTotal,
        objectsLocated,
        timeDiff,
      });
    }

    this.levels.current.nextMode();
    this.setModeMenu(currentMode, success);
    this.disableCamera();

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
    UIManager.showLoading();

    await this.levels.next();
    this.rendererPrepare();
    this.resize();

    UIManager.showMenu();
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

  private async enableFullscreen(): Promise<void> {
    try {
      await document.body.requestFullscreen();
      this.fullscreen = true;
      this.setFullscreenButton(true);
    } catch (e) {
      console.error(e);
    }
  }

  private disableFullscreen(): void {
    void document.exitFullscreen();
    this.fullscreen = false;
    this.setFullscreenButton(false);
  }

  private toggleFullscreen(): void {
    if (this.fullscreen) {
      this.disableFullscreen();
    } else {
      void this.enableFullscreen();
    }
  }

  /*
   * User interface
   */

  private makeWelcomeScreen(): void {
    UIManager.updateWelcomeScreen({
      title: TitleText.Welcome,
      info: InfoText.Welcome,
      html: MENU_HTML.Welcome,
      buttons: [
        {
          text: ButtonText.Start,
          callback: () => UIManager.showMenu(),
        },
        { text: ButtonText.About, callback: () => UIManager.about.show() },
      ],
    });
  }

  private setMenu(options: IMenuPartial, show = true): void {
    UIManager.updateMenu({
      title: options.title,
      info: options.info,
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

  private setModeMenu(currentMode: MazeMode, success: boolean): void {
    const {
      isNextStage,
      lastMode,
      mazeMode,
      number,
      timeDiff,
    } = this.levels.current;
    const lastLevel = lastMode && this.levels.isLastLevel;
    const inspectionMode = currentMode === MazeMode.Inspection;

    let title: string;
    let buttons: Array<IMenuItem>;

    if (success) {
      const { name } = MODE_TEXT[currentMode];
      title = lastMode
        ? `Level #${number} successfully completed.`
        : inspectionMode
        ? `${name} mode has ended.`
        : `${name} completed in ${timeDiff} seconds.`;
    } else {
      title = TitleText.Failed;
    }

    const { name, description } = MODE_TEXT[mazeMode];
    const info = isNextStage
      ? `First stage completed. Maze will rotate, objects locations won't change. Next mode: ${name}. ${description}`
      : lastMode
      ? ``
      : `Next mode: ${name}. ${description}`;

    if (lastMode) {
      if (lastLevel) {
        UIManager.finalScoreBoard(ScoreManager.getScores);
      } else {
        UIManager.updateScoreBoard(
          { number },
          ScoreManager.levelScores(this.levels.current.number),
        );
      }
    }

    if (lastLevel) {
      title = 'Last level completed.';
      buttons = [{ text: ButtonText.Continue, callback: () => this.reset() }];
    } else {
      buttons = [
        {
          text: ButtonText.Continue,
          callback: () => this.play(),
        },
        { text: ButtonText.Reset, callback: () => this.reset() },
      ];
    }

    UIManager.updateMenu({
      title,
      info,
      buttons,
    });
  }

  private setLevelMenu(): void {
    UIManager.updateMenu({
      title: `Start with level #${this.levels.current.number}.`,
      buttons: [
        {
          text: ButtonText.Start,
          callback: () => this.play(),
        },
        { text: ButtonText.Reset, callback: () => this.reset() },
      ],
    });
  }

  private setAboutMenu(): void {
    UIManager.updateAbout({
      title: TitleText.About,
      html: MENU_HTML.About,
      buttons: [
        {
          text: ButtonText.Back,
          callback: () => {
            UIManager.about.hide();
            UIManager.welcome.show();
          },
        },
      ],
    });

    UIManager.about.hide();
  }

  private setFullscreenButton(enabled = false): void {
    const svg: string = enabled
      ? MENU_SVG.fullscreenDisable
      : MENU_SVG.fullscreenEnable;

    UIManager.setFullscreenBtn(svg, this.toggleFullscreen.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  new App(canvas);
});
