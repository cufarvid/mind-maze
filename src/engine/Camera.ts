import { mat4, vec3 } from 'gl-matrix';
import Utils from '../utils/Utils';
import { IEntityOptions } from '../types';
import Entity from './Entity';

export default class Camera extends Entity {
  public projection: mat4 = mat4.create();
  private readonly keys: Record<string, boolean> = {};

  public aspect: number;
  private fov: number;
  private near: number;
  private far: number;
  private mouseSensitivity: number;
  private maxSpeed: number;
  private friction: number;
  private acceleration: number;

  private readonly mouseMoveHandler: EventListener;
  private readonly keyDownHandler: EventListener;
  private readonly keyUpHandler: EventListener;

  public constructor(options: IEntityOptions) {
    super(options);
    Utils.init(this, defaults, options);

    this.updateProjection();

    this.mouseMoveHandler = (event: MouseEvent) => this.mouseMove(event);
    this.keyDownHandler = (event: KeyboardEvent) => this.keyDown(event);
    this.keyUpHandler = (event: KeyboardEvent) => this.keyUp(event);
  }

  public updateProjection(): void {
    mat4.perspective(
      this.projection,
      this.fov,
      this.aspect,
      this.near,
      this.far,
    );
  }

  public update(dt: number): void {
    const forward: vec3 = vec3.set(
      vec3.create(),
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    );
    const right: vec3 = vec3.set(
      vec3.create(),
      Math.cos(this.rotation[1]),
      0,
      -Math.sin(this.rotation[1]),
    );

    // Add acceleration
    const acc: vec3 = vec3.create();
    if (this.keys['KeyW']) vec3.add(acc, acc, forward);
    if (this.keys['KeyS']) vec3.sub(acc, acc, forward);
    if (this.keys['KeyD']) vec3.add(acc, acc, right);
    if (this.keys['KeyA']) vec3.sub(acc, acc, right);

    // Update velocity
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    // Apply friction if needed
    if (
      !this.keys['KeyW'] &&
      !this.keys['KeyS'] &&
      !this.keys['KeyD'] &&
      !this.keys['KeyA']
    ) {
      vec3.scale(this.velocity, this.velocity, 1 - this.friction);
    }

    // Limit speed
    const len: number = vec3.len(this.velocity);
    if (len > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
    }
  }

  public enable(): void {
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  public disable(): void {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);

    for (const key in this.keys) {
      if (Object.prototype.hasOwnProperty.call(this.keys, key))
        this.keys[key] = false;
    }
  }

  private mouseMove(event: MouseEvent) {
    const dx = event.movementX;
    const dy = event.movementY;

    this.rotation[0] -= dy * this.mouseSensitivity;
    this.rotation[1] -= dx * this.mouseSensitivity;

    const pi: number = Math.PI;
    const twopi: number = pi * 2;
    const halfpi: number = pi / 2;

    if (this.rotation[0] > halfpi) {
      this.rotation[0] = halfpi;
    }
    if (this.rotation[0] < -halfpi) {
      this.rotation[0] = -halfpi;
    }

    this.rotation[1] = ((this.rotation[1] % twopi) + twopi) % twopi;
  }

  private keyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
  }

  private keyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }
}

const defaults: IEntityOptions = {
  aspect: 1,
  fov: 1.5,
  near: 0.01,
  far: 100,
  velocity: [0, 0, 0],
  mouseSensitivity: 0.002,
  maxSpeed: 3,
  friction: 0.2,
  acceleration: 20,
};
