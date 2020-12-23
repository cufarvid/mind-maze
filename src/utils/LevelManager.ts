import Level from '../engine/Level';

export default class LevelManager {
  private levels: Array<Level> = [];
  private readonly sceneUris: Array<string>;

  public constructor(sceneUris: Array<string>) {
    this.sceneUris = sceneUris;
    this.initLevels(sceneUris);
  }

  public async init(): Promise<void> {
    await this.current.init();
  }

  private initLevels(sceneUris: Array<string>): void {
    this.levels = sceneUris.map((uri, index) => new Level(index, uri));
  }

  public get current(): Level {
    return this.levels[0] || null;
  }

  public get isLastLevel(): boolean {
    return this.levels.length === 1;
  }

  public async next(): Promise<Level> {
    this.levels.shift();
    await this.current.init();
    return this.current;
  }

  public reset(): void {
    this.initLevels(this.sceneUris);
  }
}
