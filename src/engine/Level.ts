import { vec3 } from 'gl-matrix';
import SceneLoader from './SceneLoader';
import SceneBuilder from './SceneBuilder';
import Timer from '../utils/Timer';
import { IMazeObject, IMazePosition } from '../types';
import { MazeMode } from '../constants';
import Physics from './Physics';
import Scene from './Scene';
import Camera from './Camera';
import Entity from './Entity';
import Maze from './Maze';

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

    this.timer = new Timer(this.maze.duration);
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

  public get number(): number {
    return this.id + 1;
  }

  public get mazeObjects(): Array<IMazeObject> {
    return this.maze.getObjects;
  }

  public get objectsLocated(): number {
    return this.maze.getObjects.filter((object) => object.located).length;
  }

  public get objectsTotal(): number {
    return this.maze.getObjects.length;
  }

  public get timeDiff(): number {
    return this.timer.timeDiff;
  }

  public get lastMode(): boolean {
    return (
      this.completed && this.stage && this.maze.mode === MazeMode.PickUpInOrder
    );
  }

  public get mazeMode(): MazeMode {
    return this.maze.mode;
  }

  public get isNextStage(): boolean {
    return this.stage && this.maze.mode === MazeMode.PickUp;
  }

  public nextStage(): void {
    this.timer.stop();
    this.stage++;
    this.resetCamera();
    this.maze.resetObjects();
    this.maze.mode = MazeMode.PickUp;
  }

  public nextMode(): void {
    switch (this.maze?.mode) {
      case MazeMode.Inspection:
        this.prepareMode(MazeMode.PickUp);
        break;
      case MazeMode.PickUp:
        this.prepareMode(MazeMode.PickUpInOrder);
        break;
      case MazeMode.PickUpInOrder:
        this.stage ? this.setCompleted() : this.nextStage();
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
    this.camera.velocity = [0, 0, 0];
    this.camera.updateProjection();
  }

  private prepareMode(mode: MazeMode): void {
    this.timer.stop();
    this.resetCamera();
    this.maze.resetObjects();
    this.maze.mode = mode;
  }

  public setCompleted(): void {
    this.timer.stop();
    this.completed = true;
  }

  public checkCompleted(): boolean {
    return this.maze.getObjects.every((object) => object.located);
  }
}
