import Application from './engine/Application';
import Renderer from './engine/Renderer';
import Camera from './engine/Camera';
import SceneLoader from './engine/SceneLoader';
import SceneBuilder from './engine/SceneBuilder';
import Scene from './engine/Scene';

class App extends Application {
  private renderer: Renderer;
  private scene: Scene;
  private camera: Camera = null;
  private time: number = Date.now();
  private startTime: number = Date.now();
  private aspect = 1;

  protected start(): void {
    this.renderer = new Renderer(this.gl);
    void this.load('./assets/scenes/scene.json');
  }

  async load(uri: string): Promise<void> {
    const scene = await new SceneLoader().loadScene(uri);
    const builder = new SceneBuilder(scene);
    this.scene = builder.build();

    this.scene.traverse(
      (entity) => {
        if (entity instanceof Camera) this.camera = entity;
      },
      () => 1,
    );

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
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;

    if (this.camera) this.camera.update(dt);
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
  new App(canvas);
});
