import {
  IProgram,
  IShader,
  ITextureOptions,
  TAttributes,
  TPrograms,
  TShaders,
  TUniforms,
} from '../types';

export default class WebGLUtils {
  static createShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: GLenum,
  ): WebGLShader {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      throw new Error(`Could not compile shader.\nLog:\n${log}`);
    }

    return shader;
  }

  static createProgram(
    gl: WebGL2RenderingContext,
    shaders: Array<WebGLShader>,
  ): IProgram {
    const program: WebGLProgram = gl.createProgram();

    for (const shader of shaders) {
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      throw new Error(`Could not link program.\nLog:\n${log}`);
    }

    const attributes: TAttributes = {};
    const activeAttributes: unknown = gl.getProgramParameter(
      program,
      gl.ACTIVE_ATTRIBUTES,
    );
    for (let i = 0; i < activeAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      attributes[info.name] = gl.getAttribLocation(program, info.name);
    }

    const uniforms: TUniforms = {};
    const activeUniforms: unknown = gl.getProgramParameter(
      program,
      gl.ACTIVE_UNIFORMS,
    );
    for (let i = 0; i < activeUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info.name.includes('[0]')) {
        for (let j = 0; j < info.size; j++) {
          const uniformName = `${info.name.slice(0, -3)}[${j}]`;
          uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
      } else {
        uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
    }
    return { program, attributes, uniforms };
  }

  static buildPrograms(
    gl: WebGL2RenderingContext,
    shaders: TShaders,
  ): TPrograms {
    const programs: TPrograms = {};

    for (const key in shaders) {
      try {
        const shader: IShader = shaders[key];
        programs[key] = WebGLUtils.createProgram(gl, [
          WebGLUtils.createShader(gl, shader.vertex, gl.VERTEX_SHADER),
          WebGLUtils.createShader(gl, shader.fragment, gl.FRAGMENT_SHADER),
        ]);
      } catch (e) {
        console.error(e);
        throw new Error(`Error compiling ${key}.`);
      }
    }

    return programs;
  }

  static createTexture(
    gl: WebGL2RenderingContext,
    options: ITextureOptions,
  ): WebGLTexture {
    const target = options.target || gl.TEXTURE_2D;
    const iformat = options.iformat || gl.RGBA;
    const format = options.format || gl.RGBA;
    const type = options.type || gl.UNSIGNED_BYTE;
    const texture = options.texture || gl.createTexture();

    if (options.unit) gl.activeTexture(gl.TEXTURE0 + options.unit);

    gl.bindTexture(target, texture);

    if (options.image)
      gl.texImage2D(target, 0, iformat, format, type, options.image);
    else
      gl.texImage2D(
        target,
        0,
        iformat,
        options.width,
        options.height,
        0,
        format,
        type,
        options.data,
      );

    if (options.wrapS)
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
    if (options.wrapT)
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
    if (options.min)
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min);
    if (options.mag)
      gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag);
    if (options.mip) gl.generateMipmap(target);

    return texture;
  }
}
