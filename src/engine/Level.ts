import Physics from './Physics';
import Scene from './Scene';
import Camera from './Camera';
import SceneLoader from './SceneLoader';
import SceneBuilder from './SceneBuilder';
import Entity from './Entity';
import Maze, { MazeMode } from './Maze';
import Timer from './Timer';

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

    this.play();
  }

  public play(): void {
    this.timer = new Timer(5);
    this.timer.start();
  }

  public pause(): void {
    this.timer.stop();
  }

  public get timerRunning(): boolean {
    return this.timer.isRunning;
  }

  public nextStage(): void {
    const { translation, rotation } = this.maze.posRotate;

    this.camera.translation = translation;
    this.camera.rotation = rotation;
    this.camera.updateProjection();

    this.stage++;
    this.maze.mode = MazeMode.PickUp;
  }

  public nextMode(): void {
    switch (this.maze.mode) {
      case MazeMode.Inspection:
        this.maze.mode = MazeMode.PickUp;
        this.timer.reset();
        break;
      case MazeMode.PickUp:
        this.maze.mode = MazeMode.PickUpInOrder;
        this.timer.reset();
        break;
      case MazeMode.PickUpInOrder:
        if (!this.stage) {
          this.nextStage();
          this.timer.reset();
        } else {
          this.completed = true;
          this.timer.stop();
        }
        break;
    }
    console.log(this.maze.mode);
  }
}
