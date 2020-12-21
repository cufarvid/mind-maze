import Entity from './engine/Entity';
import { vec3 } from 'gl-matrix';
import Mesh from './engine/Mesh';

/*
 * Interfaces
 */

/*
 * Program
 */
export interface IProgram {
  program: WebGLProgram;
  attributes: Record<string, GLint>;
  uniforms: Record<string, WebGLUniformLocation>;
}

/*
 * Shader
 */
export interface IShader {
  vertex: string;
  fragment: string;
}

/*
 * Texture
 */
export interface ITextureOptions {
  target?: GLenum;
  iformat?: GLint;
  width?: GLsizei;
  height?: GLsizei;
  border?: GLint;
  format?: GLenum;
  type?: GLenum;
  texture?: GLenum;
  unit?: GLenum;
  image?: TexImageSource;
  data?: ArrayBufferView;
  wrapS?: GLint;
  wrapT?: GLint;
  min?: GLint;
  mag?: GLint;
  mip?: GLint;
}

/*
 * Scene
 */
export interface ISceneData {
  entities: Array<IEntityOptions>;
  textures: Array<string>;
  meshes: Array<string>;
}

export interface ISceneOptions {
  entities: Array<IEntityOptions>;
  textures: Array<HTMLImageElement>;
  meshes: Array<IMeshData>;
}

/*
 * Entity
 */
export interface IEntityOptions {
  name?: string;
  type?: string;
  translation?: vec3;
  aabb?: AABB;
  // Camera
  aspect?: number;
  fov?: number;
  near?: number;
  far?: number;
  velocity?: vec3;
  mouseSensitivity?: number;
  maxSpeed?: number;
  friction?: number;
  acceleration?: number;
  // Model
  rotation?: vec3;
  scale?: vec3;
  mesh?: number;
  texture?: number;
  // Floor
  width?: number;
  height?: number;
  roughness?: number;
  // Light
  ambientColor?: vec3;
  diffuseColor?: vec3;
  specularColor?: vec3;
  attenuation?: vec3;
  shininess?: number;
  // Maze
  seed?: string;
  objects?: Array<IMazeObjectOptions>;
}

export interface IEntityGlProps {
  texture: WebGLTexture;
  vao: WebGLVertexArrayObject;
  indices?: number;
  count?: number;
}

export interface AABB {
  min: vec3;
  max: vec3;
}

/*
 * Maze
 */
export interface IModelData {
  name?: string;
  mesh: Mesh;
  image: HTMLImageElement;
  translation?: vec3;
  aabb?: AABB;
  scale?: vec3;
}

export interface IMazeObjectOptions {
  name: string;
  mesh: number;
  texture: number;
  translation?: vec3;
  aabb?: AABB;
  scale?: vec3;
}

export interface IMazeObject {
  id: number;
  name: string;
  found: boolean;
}

/*
 * Mesh
 */
export interface IMeshData {
  vertices: Array<number>;
  texcoords: Array<number>;
  normals: Array<number>;
  indices: Array<number>;
}

/*
 * Traverse function
 */
export interface ITraverseFunction {
  (entity: Entity): void;
}

export interface TraverseParams {
  before: ITraverseFunction;
  after: ITraverseFunction;
}

/*
 * Model
 */
export interface ModelRecord {
  vao: WebGLVertexArrayObject;
  indices?: number;
  count?: number;
}

/*
 * Types
 */
export type TAttributes = Record<string, GLint>;

export type TPrograms = Record<string, IProgram>;

export type TShaders = Record<string, IShader>;

export type TUniforms = Record<string, WebGLUniformLocation>;

export type TMazeObjectsData = Array<IModelData>;

export type TMazeObjects = Array<IMazeObject>;
