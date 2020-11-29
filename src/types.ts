import Node from './engine/Node';

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
  nodes: Array<ICameraNode | IModelNode>;
  textures: Array<string>;
  meshes: Array<string>;
}

export interface IScene {
  nodes: Array<ICameraNode | IModelNode>;
  textures: Array<HTMLImageElement>;
  meshes: Array<IMeshData>;
}

interface INode {
  type: string;
  translation: Array<number>;
  aabb: AABB;
}

export interface ICameraNode extends INode {
  aspect: number;
  fov: number;
  near: number;
  far: number;
}

export interface IModelNode extends INode {
  mesh: number;
  texture: number;
}

interface AABB {
  min: Array<number>;
  max: Array<number>;
}

export interface IMeshData {
  vertices: Array<number>;
  texcoords: Array<number>;
  normals: Array<number>;
  indices: Array<number>;
}

export interface ITraverseFunction {
  (node: Node): void;
}

// Types
export type TAttributes = Record<string, GLint>;

export type TPrograms = Record<string, IProgram>;

export type TShaders = Record<string, IShader>;

export type TUniforms = Record<string, WebGLUniformLocation>;
