// Interfaces
export interface Program {
  program: WebGLProgram;
  attributes: Record<string, GLint>;
  uniforms: Record<string, WebGLUniformLocation>;
}

export interface Shader {
  vertex: string;
  fragment: string;
}

export interface TextureOptions {
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

// Types
export type Attributes = Record<string, GLint>;

export type Programs = Record<string, Program>;

export type Shaders = Record<string, Shader>;

export type Uniforms = Record<string, WebGLUniformLocation>;
