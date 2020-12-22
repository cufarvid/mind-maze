import Level from '../engine/Level';

export default class LevelManager {
  private levels: Array<Level> = [];

  public constructor(sceneUris: Array<string>) {
    this.initLevels(sceneUris);
    console.log(this.levels);
    console.log(this.current);
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

  public async next(): Promise<Level> {
    this.levels.shift();
    await this.current.init();
    return this.current;
  }
}
