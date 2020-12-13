import seedrandom from 'seedrandom';
import Entity from './Entity';
import { IEntityOptions } from '../types';
import Mesh from './Mesh';
import Model from './Model';

export default class Maze extends Entity {
  public constructor(
    mesh: Mesh,
    image: HTMLImageElement,
    options: IEntityOptions,
  ) {
    super(null);
    this.makeBlocks(mesh, image, options);
    console.log(Maze.generate(5, 5, 'hello'));
  }

  private makeBlocks(
    mesh: Mesh,
    image: HTMLImageElement,
    options: IEntityOptions,
  ): void {
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

    for (let h = 0; h < options.height * 2; h += 2) {
      for (let w = 0; w < options.width * 2; w += 2) {
        if (h === 0) {
          this.addChild(
            new Model(mesh, image, {
              ...hOptions,
              translation: [w, 1, h],
            }),
          );
        } else if (h === options.height * 2 - 2) {
          this.addChild(
            new Model(mesh, image, {
              ...hOptions,
              translation: [w, 1, h],
            }),
          );
        }
      }
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

    const horizontal = [];
    const vertical = [];
    const rand = seedrandom(seed).quick();
    let here = [Math.floor(rand * x), Math.floor(rand * y)];
    const path = [here];
    const unvisited = [];
    let next = [];

    for (let j = 0; j < x + 1; j++) {
      horizontal[j] = [];
      vertical[j] = [];
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
          horizontal[next[0]][(next[1] + here[1] - 1) / 2] = true;
        } else {
          vertical[(next[0] + here[0] - 1) / 2][next[1]] = true;
        }

        path.push((here = next));
      } else {
        here = path.pop();
      }
    }

    return {
      horizontal: Maze.fixEmpty(horizontal),
      vertical: Maze.fixEmpty(vertical),
    };
  }

  public static fixEmpty(array: Array<Array<boolean>>): Array<Array<boolean>> {
    for (const arr of array) {
      for (let i = 0; i < arr.length; i++) {
        const diff = array.length - 1 - arr.length;
        if (!arr[i]) arr[i] = false;
        if (diff > 0) arr.push(...new Array(diff).fill(false));
      }
    }
    return array;
  }
}
