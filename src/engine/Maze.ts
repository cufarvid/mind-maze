import seedrandom from 'seedrandom';
import Entity from './Entity';
import { IEntityOptions, TMazeObjects } from '../types';
import Mesh from './Mesh';
import Model from './Model';

export default class Maze extends Entity {
  public constructor(options: IEntityOptions, objectData: TMazeObjects) {
    super(null);
    this.makeWalls(options, objectData);
  }

  private makeWalls(options: IEntityOptions, objectData: TMazeObjects): void {
    // Wall options
    const hOptions: IEntityOptions = {
      aabb: {
        min: [-1, -1, -0.1],
        max: [1, 1, 0.1],
      },
      scale: [1, 1, 0.1],
    };
    const vOptions: IEntityOptions = {
      aabb: {
        min: [-0.1, -1, -1],
        max: [0.1, 1, 1],
      },
      scale: [0.1, 1, 1],
    };

    const { mesh, image } = objectData.find((obj) => obj.name === 'wall');
    const { width, height } = options;
    const { horizontal, vertical } = Maze.generate(
      options.width,
      options.height,
      'hello',
    );

    const centerX = 0.1;
    const centerZ = 3;

    // Outer horizontal
    const startRow = Array(width).fill(false);
    startRow[0] = true;

    this.makeBlock(
      mesh,
      image,
      [startRow, Array(width).fill(false)],
      hOptions,
      centerX,
      centerZ - 2,
      2,
      height * 2,
    );
    // Inner horizontal
    this.makeBlock(mesh, image, horizontal, hOptions, centerX, centerZ);

    // Outer vertical
    this.makeBlock(
      mesh,
      image,
      Array(height).fill(Array(1).fill(false)),
      vOptions,
      centerX - 1,
      centerZ - 1,
    );
    // Inner vertical
    this.makeBlock(mesh, image, vertical, vOptions, centerX + 1, centerZ - 1);
  }

  private makeBlock(
    mesh: Mesh,
    image: HTMLImageElement,
    array: Array<Array<boolean>>,
    modelOptions: IEntityOptions,
    startX = 0,
    startZ = 0,
    offsetX = 2,
    offsetZ = 2,
  ): void {
    let x = startX;
    let z = startZ;
    for (const row of array) {
      for (const hole of row) {
        if (!hole) {
          this.addChild(
            new Model(mesh, image, {
              ...modelOptions,
              translation: [x, 1, z],
            }),
          );
        }
        x += offsetX;
      }
      x = startX;
      z += offsetZ;
    }
  }

  public static generate(
    x: number,
    y: number,
    seed: string,
  ): Record<string, Array<Array<boolean>>> {
    let n = x * y - 1;
    if (n < 0) {
      throw new Error('Illegal maze dimensions!');
    }

    const vertical = [];
    const horizontal = [];
    const rand = seedrandom(seed).quick();
    let here = [Math.floor(rand * x), Math.floor(rand * y)];
    const path = [here];
    const unvisited = [];
    let next = [];

    for (let j = 0; j < x + 1; j++) {
      vertical[j] = [];
      horizontal[j] = [];
    }

    for (let j = 0; j < x + 2; j++) {
      unvisited[j] = [];

      for (let k = 0; k < y + 1; k++) {
        unvisited[j].push(
          j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1),
        );
      }
    }
    while (n > 0) {
      const potential = [
        [here[0] + 1, here[1]],
        [here[0], here[1] + 1],
        [here[0] - 1, here[1]],
        [here[0], here[1] - 1],
      ];
      const neighbors = [];

      for (let j = 0; j < 4; j++) {
        if (unvisited[potential[j][0] + 1][potential[j][1] + 1]) {
          neighbors.push(potential[j]);
        }
      }

      if (neighbors.length) {
        n = n - 1;
        next = neighbors[Math.floor(rand * neighbors.length)];
        unvisited[next[0] + 1][next[1] + 1] = false;

        if (next[0] == here[0]) {
          vertical[next[0]][(next[1] + here[1] - 1) / 2] = true;
        } else {
          horizontal[(next[0] + here[0] - 1) / 2][next[1]] = true;
        }

        path.push((here = next));
      } else {
        here = path.pop();
      }
    }

    console.log(Maze.display(x, y, vertical, horizontal));

    return {
      horizontal: Maze.fixEmpty(horizontal),
      vertical: Maze.fixEmpty(vertical, true),
    };
  }

  public static fixEmpty(
    array: Array<Array<boolean>>,
    vertical = false,
  ): Array<Array<boolean>> {
    for (const arr of array) {
      for (let i = 0; i < arr.length; i++) {
        const diff = array.length - 1 - arr.length;
        if (!arr[i]) arr[i] = false;
        if (diff > 0) arr.push(...new Array(diff).fill(false));
      }
    }
    if (vertical) array[array.length - 2][array.length - 2] = true;
    return array;
  }

  public static display(
    x: number,
    y: number,
    horiz: Array<Array<boolean>>,
    verti: Array<Array<boolean>>,
  ): string {
    const text = [];
    for (let j = 0; j < x * 2 + 1; j++) {
      const line = [];
      if (0 == j % 2)
        for (let k = 0; k < y * 4 + 1; k++)
          if (0 == k % 4) line[k] = '+';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          else if (j > 0 && verti[j / 2 - 1][Math.floor(k / 4)]) line[k] = ' ';
          else line[k] = '-';
      else
        for (let k = 0; k < y * 4 + 1; k++)
          if (0 == k % 4) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (k > 0 && horiz[(j - 1) / 2][k / 4 - 1]) line[k] = ' ';
            else line[k] = '|';
          } else line[k] = ' ';
      if (0 == j) line[1] = line[2] = line[3] = ' ';
      if (x * 2 - 1 == j) line[4 * y] = ' ';
      text.push(line.join('') + '\r\n');
    }

    return text.join('');
  }
}
