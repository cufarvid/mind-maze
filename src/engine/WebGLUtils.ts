import { ProgramRecord, ShaderRecord, TextureOptions } from '../types';

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
  ): ProgramRecord {
    const program: WebGLProgram = gl.createProgram();

    for (const shader of shaders) {
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      throw new Error(`Could not link program.\nLog:\n${log}`);
    }

    const attributes: Record<string, GLint> = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const activeAttributes = gl.getProgramParameter(
      program,
      gl.ACTIVE_ATTRIBUTES,
    );
    for (let i = 0; i < activeAttributes; i++) {
      const info = gl.getActiveAttrib(program, i);
      attributes[info.name] = gl.getAttribLocation(program, info.name);
    }

    const uniforms: Record<string, WebGLUniformLocation> = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < activeUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    return { program, attributes, uniforms };
  }

  static buildPrograms(
    gl: WebGL2RenderingContext,
    shaders: Record<string, ShaderRecord>,
  ): Record<string, ProgramRecord> {
    const programs: Record<string, ProgramRecord> = {};

    for (const key in shaders) {
      try {
        const program: ShaderRecord = shaders[key];
        programs[key] = WebGLUtils.createProgram(gl, [
          WebGLUtils.createShader(gl, program.vertex, gl.VERTEX_SHADER),
          WebGLUtils.createShader(gl, program.fragment, gl.FRAGMENT_SHADER),
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
    options: TextureOptions,
  ): WebGLTexture {
    const target = options.target || gl.TEXTURE_2D;
    const iformat = options.iformat || gl.RGBA;
    const format = options.format || gl.RGBA;
    const type = options.type || gl.UNSIGNED_BYTE;
    const texture = options.texture || gl.createTexture();

    if (options.unit) {
      gl.activeTexture(gl.TEXTURE0 + options.unit);
    }

    if (options.image)
      gl.texImage2D(target, 0, iformat, format, type, options.image);
    else
      gl.texImage2D(
        target,
        0,
        iformat,
        options.width,
        options.height,
        options.border,
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
