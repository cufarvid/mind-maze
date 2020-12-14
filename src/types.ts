import Entity from './engine/Entity';
import { vec3 } from 'gl-matrix';
import Mesh from './engine/Mesh';

// Interfaces
export interface IProgram {
  program: WebGLProgram;
  attributes: Record<string, GLint>;
  uniforms: Record<string, WebGLUniformLocation>;
}

export interface IShader {
  vertex: string;
  fragment: string;
}

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

export interface IEntityOptions {
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
  blocks?: IMazeBlockOptions;
}

export interface IMazeBlockOptions {
  wall: Record<string, number>;
  holder: Record<string, number>;
}

export interface IMazeBlockData {
  wall: IModelData;
  holder: IModelData;
}

export interface IModelData {
  mesh: Mesh;
  image: HTMLImageElement;
  location?: vec3;
}

export interface IEntityGlProps {
  texture: WebGLTexture;
  vao: WebGLVertexArrayObject;
  indices: number;
}

export interface AABB {
  min: vec3;
  max: vec3;
}

export interface IMeshData {
  vertices: Array<number>;
  texcoords: Array<number>;
  normals: Array<number>;
  indices: Array<number>;
}

export interface ITraverseFunction {
  (entity: Entity): void;
}

export interface TraverseParams {
  before: ITraverseFunction;
  after: ITraverseFunction;
}

export interface ModelRecord {
  vao: WebGLVertexArrayObject;
  indices: number;
}

// Types
export type TAttributes = Record<string, GLint>;

export type TPrograms = Record<string, IProgram>;

export type TShaders = Record<string, IShader>;

export type TUniforms = Record<string, WebGLUniformLocation>;
