import { mat4 } from 'gl-matrix';
import WebGLUtils from './WebGLUtils';
import shaders from '../shaders/shaders';
import { IEntityGlProps, IProgram, ModelRecord, TPrograms } from '../types';
import Camera from './Camera';
import Entity from './Entity';
import Mesh from './Mesh';
import Scene from './Scene';

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
      entity.props = {} as IEntityGlProps;
      if (entity.mesh)
        Object.assign(entity.props, this.createModel(entity.mesh));
      if (entity.image) entity.props.texture = this.createTexture(entity.image);
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

    scene.traverse({
      before: (entity: Entity) => {
        matrixStack.push(mat4.clone(matrix));
        mat4.mul(matrix, matrix, entity.transform);
        if (entity.props.vao) {
          gl.bindVertexArray(entity.props.vao);
          gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrix);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, entity.props.texture);
          gl.uniform1i(program.uniforms.uTexture, 0);
          gl.drawElements(
            gl.TRIANGLES,
            entity.props.indices,
            gl.UNSIGNED_SHORT,
            0,
          );
        }
      },
      after: () => (matrix = matrixStack.pop()),
    });
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

    const indices: number = modelMesh.indices.length;
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
