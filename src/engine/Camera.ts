import { mat4, vec3 } from 'gl-matrix';
import Entity from './Entity';
import { IEntityOptions } from '../types';

export default class Camera extends Entity {
  public projection: mat4 = mat4.create();
  private keys: Record<string, boolean> = {};

  public aspect = 1;
  private fov = 1.5;
  private near = 0.01;
  private far = 100;
  private velocity: vec3 = [0, 0, 0];
  private mouseSensitivity = 0.002;
  private maxSpeed = 3;
  private friction = 0.2;
  private acceleration = 20;

  public constructor(options: IEntityOptions) {
    super(options);
    this.setOptions(options);
    this.updateProjection();
  }

  public setOptions(options: IEntityOptions): void {
    this.aspect = options.aspect || this.aspect;
    this.fov = options.fov || this.fov;
    this.near = options.near || this.near;
    this.far = options.far || this.far;
    this.velocity = options.velocity || this.velocity;
    this.mouseSensitivity = options.mouseSensitivity || this.mouseSensitivity;
    this.maxSpeed = options.maxSpeed || this.maxSpeed;
    this.friction = options.friction || this.friction;
    this.acceleration = options.acceleration || this.acceleration;
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

  public update(timeDelta: number): void {
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
    const acceleration: vec3 = vec3.create();
    if (this.keys['KeyW']) vec3.add(acceleration, acceleration, forward);
    if (this.keys['KeyS']) vec3.sub(acceleration, acceleration, forward);
    if (this.keys['KeyD']) vec3.add(acceleration, acceleration, right);
    if (this.keys['KeyA']) vec3.sub(acceleration, acceleration, right);

    // Update velocity
    vec3.scaleAndAdd(
      this.velocity,
      this.velocity,
      acceleration,
      timeDelta * this.acceleration,
    );

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
    const len = vec3.len(this.velocity);
    if (len > this.maxSpeed)
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
  }

  public enable(): void {
    document.addEventListener('mousemove', (e) => this.mouseMoveHandler(e));
    document.addEventListener('keydown', (e) => this.keyDownHandler(e));
    document.addEventListener('keydown', (e) => this.keyUpHandler(e));
  }

  public disable(): void {
    document.removeEventListener('mousemove', (e) => this.mouseMoveHandler(e));
    document.removeEventListener('keydown', (e) => this.keyDownHandler(e));
    document.removeEventListener('keydown', (e) => this.keyUpHandler(e));

    for (const key in this.keys) {
      this.keys[key] = false;
    }
  }

  private mouseMoveHandler(event: MouseEvent): void {
    const dx = event.movementX;
    const dy = event.movementY;

    this.rotation[0] -= dy * this.mouseSensitivity;
    this.rotation[1] -= dx * this.mouseSensitivity;

    const pi = Math.PI;
    const twopi = pi * 2;
    const halfpi = pi / 2;

    if (this.rotation[0] > halfpi) this.rotation[0] = halfpi;
    if (this.rotation[0] < -halfpi) this.rotation[0] = -halfpi;

    this.rotation[1] = ((this.rotation[1] % twopi) + twopi) % twopi;
  }

  private keyUpHandler(event: KeyboardEvent): void {
    this.keys[event.code] = true;
  }

  private keyDownHandler(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }
}
