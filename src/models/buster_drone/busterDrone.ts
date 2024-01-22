import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import busterDrone from "./scene.gltf";

class BusterDrone {
  loader: GLTFLoader;
  gltf?: GLTF;

  constructor() {
    this.loader = new GLTFLoader();
  }

  load = (): Promise<void> =>
    new Promise((resolve) => {
      console.log("Start loading");

      this.loader.load(busterDrone, (data) => {
        this.gltf = data;
        resolve();
      });
    });
}

export default BusterDrone;
