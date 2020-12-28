import seedrandom from 'seedrandom';
import UIManager from '../utils/UIManager';
import { MazeMode } from '../constants';
import Entity from './Entity';
import {
  IEntityOptions,
  IMazeObject,
  IMazePosition,
  IModelData,
  TMazeObjects,
  TMazeObjectsData,
} from '../types';
import Mesh from './Mesh';
import Model from './Model';
import PickUpModel from './PickUpModel';
import Floor from './Floor';
import { vec3 } from 'gl-matrix';

export default class Maze extends Entity {
  private objects: TMazeObjects = [];
  public mode: MazeMode = MazeMode.Inspection;
  public posInitial: IMazePosition;
  public posRotate: IMazePosition;
  public duration: number;

  public constructor(options: IEntityOptions, objectData: TMazeObjectsData) {
    super(null);
    this.posInitial = options.posInitial;
    this.posRotate = options.posRotate;
    this.duration = options.duration;

    this.makeWalls(options.width, options.height, options.seed, objectData);
    this.makeObjects(objectData);
    this.makeFloor(options.width, options.height, objectData);

    UIManager.updateObjectBox(this.objects);
    UIManager.objectBox.hide();
  }

  public setObjectLocated(index: number): void {
    this.objects[index].located = true;
    UIManager.updateObjectBox(this.objects);
  }

  public get nextObject(): IMazeObject {
    return this.objects.find((obj) => !obj.located);
  }

  public get mInspection(): boolean {
    return this.mode === MazeMode.Inspection;
  }

  public get mPickUp(): boolean {
    return this.mode === MazeMode.PickUp;
  }

  public get mPickUpInOrder(): boolean {
    return this.mode === MazeMode.PickUpInOrder;
  }

  public get getObjects(): Array<IMazeObject> {
    return this.objects;
  }

  public resetObjects(): void {
    this.objects.forEach((object) => (object.located = false));
    this.getChildren.forEach((child) => {
      if (child instanceof PickUpModel) child.located = false;
    });

    UIManager.updateObjectBox(this.objects);
  }

  private makeWalls(
    width = 5,
    height = 5,
    seed: string,
    objectData: TMazeObjectsData,
  ): void {
    const { mesh, image, color } = objectData.find(
      (obj) => obj.name === 'wall',
    );
    const { horizontal, vertical } = Maze.generate(width, height, seed);

    const centerX = 0.1;
    const centerZ = 3;
    const blockSize = 2;

    const hTex = color ? null : { scale: [1, 1, 0.1] as vec3 };
    const vTex = color
      ? { rotation: [0, 1.57, 0] as vec3 }
      : { scale: [0.1, 1, 1] as vec3 };

    // Wall options
    const hOptions: IEntityOptions = {
      aabb: {
        min: [-1, -1, -0.1],
        max: [1, 1, 0.1],
      },
      ...hTex,
      color,
    };
    const vOptions: IEntityOptions = {
      aabb: {
        min: [-0.1, -1, -1],
        max: [0.1, 1, 1],
      },
      ...vTex,
      color,
    };

    // Outer horizontal
    const startRow = Array(width).fill(false);
    startRow[0] = true;

    this.makeWallSegment(
      mesh,
      image,
      [startRow, Array(width).fill(false)],
      hOptions,
      centerX,
      centerZ - blockSize,
      blockSize,
      height * 2,
    );
    // Inner horizontal
    this.makeWallSegment(mesh, image, horizontal, hOptions, centerX, centerZ);

    // Outer vertical
    this.makeWallSegment(
      mesh,
      image,
      Array(height).fill([false]),
      vOptions,
      centerX - 1,
      centerZ - 1,
    );
    // Inner vertical
    this.makeWallSegment(
      mesh,
      image,
      vertical,
      vOptions,
      centerX + 1,
      centerZ - 1,
    );

    // Invisible horizontal
    this.makeWallSegment(
      mesh,
      null,
      Array(2).fill(Array(width + 2).fill(false)),
      { ...hOptions, scale: [0, 0.1, 0] },
      centerX - blockSize,
      centerZ - blockSize * 2,
      blockSize,
      height * 2 + blockSize * 2,
    );
    // Invisible vertical
    this.makeWallSegment(
      mesh,
      null,
      Array(height + 2).fill([false, false]),
      { ...vOptions, scale: [0, 0.1, 0] },
      centerX - 3,
      0,
      width * 2 + blockSize * 2,
    );
  }

  private makeObjects(objectData: TMazeObjectsData): void {
    const exclude = ['wall', 'holder', 'floor'];
    const holder = objectData.find((obj) => obj.name === 'holder');
    const filtered = objectData.filter((obj) => !exclude.includes(obj.name));

    filtered.forEach((obj, index) => {
      this.objects.push({
        id: index,
        name: obj.name,
        located: false,
      });

      this.makeObjectSegment(index, obj, holder);
    });
  }

  private makeObjectSegment(
    id: number,
    object: IModelData,
    holder: IModelData,
  ): void {
    const hOptions: IEntityOptions = {
      aabb: {
        min: [-0.2, -1, -0.2],
        max: [0.2, 1, 0.2],
      },
    };
    const [x, , z] = object.translation as Array<number>;

    this.addChild(
      new Model(holder.mesh, holder.image, {
        ...hOptions,
        translation: [x, 0.4, z],
        color: holder.color,
      }),
    );

    this.addChild(
      new PickUpModel(id, object.mesh, object.image, {
        translation: object.translation,
        aabb: object.aabb,
        scale: object.scale,
        color: object.color,
      }),
    );
  }

  private makeWallSegment(
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
              color: modelOptions.color,
            }),
          );
        }
        x += offsetX;
      }
      x = startX;
      z += offsetZ;
    }
  }

  private makeFloor(
    width: number,
    height: number,
    objectData: TMazeObjectsData,
  ): void {
    const floor = objectData.find((obj) => obj.name === 'floor');
    this.addChild(
      new Floor(floor.image, {
        width: width * 2,
        height: height * 2,
        translation: [width - 1, 0, height + 1],
        color: floor.color,
      }),
    );
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
    const rand = seedrandom(seed);
    let here = [Math.floor(rand() * x), Math.floor(rand() * y)];
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
        next = neighbors[Math.floor(rand() * neighbors.length)];
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
