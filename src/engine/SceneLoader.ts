import { IScene, ISceneData } from '../types';

export default class SceneLoader {
  public async loadScene(uri: string): Promise<IScene> {
    const sceneData: ISceneData = await SceneLoader.loadJson(uri);
    const images = sceneData.textures.map((uri) => this.loadImage(uri));
    const meshes = sceneData.meshes.map((uri) => SceneLoader.loadJson(uri));

    return {
      nodes: sceneData.nodes,
      textures: await Promise.all(images),
      meshes: await Promise.all(meshes),
    };
  }

  private loadImage(uri: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = uri;
    });
  }

  private static loadJson = (uri: string): Promise<never> =>
    fetch(uri).then((response) => response.json()) as Promise<never>;
}
