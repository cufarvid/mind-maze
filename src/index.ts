import Application from './engine/Application';
import Renderer from './engine/Renderer';
import Physics from './engine/Physics';
import Camera from './engine/Camera';
import SceneLoader from './engine/SceneLoader';
import SceneBuilder from './engine/SceneBuilder';
import Scene from './engine/Scene';
import Entity from './engine/Entity';
import * as dat from 'dat.gui';

class App extends Application {
  private renderer: Renderer;
  private scene: Scene;
  private camera: Camera = null;
  private time: number = Date.now();
  private startTime: number = Date.now();
  private aspect = 1;
  private physics: Physics;

  protected start(): void {
    this.renderer = new Renderer(this.gl);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      'pointerlockchange',
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.pointerlockchangeHandler,
    );

    void this.load('./assets/scenes/scene.json');
  }

  private async load(uri: string): Promise<void> {
    const scene = await new SceneLoader().loadScene(uri);
    const builder = new SceneBuilder(scene);
    this.scene = builder.build();
    this.physics = new Physics(this.scene);

    this.scene.traverse({
      before: (entity: Entity) => {
        if (entity instanceof Camera) this.camera = entity;
      },
      after: null,
    });

    this.camera.aspect = this.aspect;
    this.camera.updateProjection();
    this.renderer.prepare(this.scene);
  }

  protected enableCamera(): void {
    this.canvas.requestPointerLock();
  }

  protected pointerlockchangeHandler(): void {
    if (!this.camera) return;

    if (document.pointerLockElement === this.canvas) this.camera.enable();
    else this.camera.disable();
  }

  protected update(): void {
    this.time = Date.now();
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.camera) this.camera.update(dt);

    if (this.physics) this.physics.update(dt);
  }

  protected render(): void {
    if (this.scene) this.renderer.render(this.scene, this.camera);
  }

  protected resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.aspect = w / h;
    if (this.camera) {
      this.camera.aspect = this.aspect;
      this.camera.updateProjection();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  const app = new App(canvas);
  const gui = new dat.GUI();
  gui.add(app, 'enableCamera');
});
