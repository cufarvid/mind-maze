import { IProgram, ModelRecord, TPrograms } from '../types';
import WebGLUtils from './WebGLUtils';
import shaders from '../shaders/shaders';
import Scene from './Scene';
import Mesh from './Mesh';
import Camera from './Camera';
import { mat4 } from 'gl-matrix';

export default class Renderer {
  private readonly gl: WebGL2RenderingContext;
  private programs: TPrograms;
  private defaultTexture: WebGLTexture;

  public constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    this.programs = WebGLUtils.buildPrograms(gl, shaders);

    this.defaultTexture = WebGLUtils.createTexture(gl, {
      width: 1,
      height: 1,
      data: new Uint8Array([255, 255, 255, 255]),
    });
  }

  public prepare(scene: Scene): void {
    scene.entities.forEach((entity) => {
      entity.gl = {};
      if (entity.mesh) Object.assign(entity.gl, this.createModel(entity.mesh));
      if (entity.texture)
        entity.gl.texture = this.createTexture(entity.texture);
    });
  }

  public render(scene: Scene, camera: Camera): void {
    const gl: WebGL2RenderingContext = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const program: IProgram = this.programs.simple;
    gl.useProgram(program.program);

    let matrix: mat4 = mat4.create();
    const matrixStack: Array<mat4> = [];

    const viewMatrix: mat4 = camera.getGlobalTransform();
    mat4.invert(viewMatrix, viewMatrix);
    mat4.copy(matrix, viewMatrix);
    gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera.projection);

    scene.traverse(
      (entity) => {
        matrixStack.push(mat4.clone(matrix));
        mat4.mul(matrix, matrix, entity.transform);

        if (entity.gl.vao) {
          gl.bindVertexArray(entity.gl.vao);
          gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrix);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, entity.gl.texture);
          gl.uniform1i(program.uniforms.uTexture, 0);
          gl.drawElements(
            gl.TRIANGLES,
            entity.gl.indices,
            gl.UNSIGNED_SHORT,
            0,
          );
        }
      },
      () => (matrix = matrixStack.pop()),
    );
  }

  private createModel(modelMesh: Mesh): ModelRecord {
    const gl: WebGL2RenderingContext = this.gl;

    const vao: WebGLVertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(modelMesh.vertices),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(modelMesh.texcoords),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(modelMesh.normals),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    const indices = modelMesh.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(modelMesh.indices),
      gl.STATIC_DRAW,
    );

    return { vao, indices };
  }

  private createTexture(texture: TexImageSource): WebGLTexture {
    return WebGLUtils.createTexture(this.gl, {
      image: texture,
      min: this.gl.NEAREST,
      mag: this.gl.NEAREST,
    });
  }
}
