import Physics from './Physics';
import Scene from './Scene';
import Camera from './Camera';
import SceneLoader from './SceneLoader';
import SceneBuilder from './SceneBuilder';
import Entity from './Entity';
import Maze, { MazeMode } from './Maze';
import Timer from '../utils/Timer';
import { IMazePosition } from '../types';
import { vec3 } from 'gl-matrix';

export default class Level {
  public id: number;
  private readonly sceneUri: string;
  private stage = 0;
  private maze: Maze;
  public completed = false;
  public timer: Timer;

  public physics: Physics;
  public scene: Scene;
  public camera: Camera = null;
  public aspect = 1;

  public constructor(id: number, sceneUri: string) {
    this.id = id;
    this.sceneUri = sceneUri;
    this.timer = new Timer(5);
  }

  public async init(): Promise<void> {
    const sceneData = await new SceneLoader().loadScene(this.sceneUri);
    const builder = new SceneBuilder(sceneData);
    this.scene = builder.build();
    this.physics = new Physics(this.scene);

    this.scene.traverse({
      before: (entity: Entity) => {
        if (entity instanceof Camera) this.camera = entity;
        if (entity instanceof Maze) this.maze = entity;
      },
      after: null,
    });

    this.camera.aspect = this.aspect;
    this.camera.updateProjection();
  }

  public play(): void {
    this.timer.start();
  }

  public pause(): void {
    this.timer.stop();
  }

  public resume(): void {
    this.timer.resume();
  }

  public get timerRunning(): boolean {
    return this.timer.isRunning;
  }

  public nextStage(): void {
    this.updateCamera(this.maze.posRotate);
    this.stage++;
    this.maze.mode = MazeMode.PickUp;
  }

  public nextMode(): void {
    switch (this.maze?.mode) {
      case MazeMode.Inspection:
        this.timer.stop();
        this.resetCamera();
        this.maze.mode = MazeMode.PickUp;
        break;
      case MazeMode.PickUp:
        this.timer.stop();
        this.resetCamera();
        this.maze.mode = MazeMode.PickUpInOrder;
        break;
      case MazeMode.PickUpInOrder:
        if (!this.stage) {
          this.timer.stop();
          this.resetCamera();
          this.nextStage();
        } else {
          this.timer.stop();
          this.completed = true;
        }
        break;
    }
  }

  private resetCamera(): void {
    if (!this.stage) this.updateCamera(this.maze.posInitial);
    else this.updateCamera(this.maze.posRotate);
  }

  private updateCamera(position: IMazePosition): void {
    vec3.copy(this.camera.translation, position.translation);
    vec3.copy(this.camera.rotation, position.rotation);
    this.camera.updateProjection();
  }
}
