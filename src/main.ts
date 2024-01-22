import {
  ACESFilmicToneMapping,
  Color,
  FloatType,
  PCFSoftShadowMap,
  PMREMGenerator,
  PerspectiveCamera,
  PointLight,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { asyncAnimationFrame } from "./utils";
import BusterDrone from "./models/buster_drone/busterDrone";
import MainScene from "./mainScene";
import { RGBELoader } from "three/examples/jsm/Addons.js";

import "./style.css";

class Main {
  scene: MainScene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  animating = false;
  controls: OrbitControls;

  busterDrone?: BusterDrone;

  constructor() {
    this.scene = new MainScene();
    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // this.camera.position.set(0, 0, 50);
    this.camera.position.set(-17, 31, 33);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    // const ambientLight = new HemisphereLight("white", "darkslategrey", 5);
    // this.scene.add(ambientLight);

    const light = new PointLight(
      new Color("#ffcb8e").convertSRGBToLinear(),
      800,
      200
    );
    light.position.set(10, 20, 10);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    this.scene.add(light);

    this.addResizeAction();
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.dampingFactor = 0.05;
    this.controls.enableDamping = true;
  }

  // async loadModels() {
  //   this.busterDrone = new BusterDrone();
  //   await this.busterDrone.load();
  //   console.log("Loaded");

  //   if (this.busterDrone.gltf) this.scene.add(this.busterDrone.gltf.scene);
  // }

  async start() {
    // await this.loadModels();
    const pmrem = new PMREMGenerator(this.renderer);
    const envmapTexture = await new RGBELoader()
      .setDataType(FloatType)
      .loadAsync("hdrs/envmap.hdr");
    const envMap = pmrem.fromEquirectangular(envmapTexture).texture;

    // const sphereMesh = new Mesh(
    //   new SphereGeometry(5, 10, 10),
    //   new MeshStandardMaterial({
    //     envMap,
    //     roughness: 0,
    //     metalness: 1,
    //   })
    // );

    await this.scene.init(envMap);
    // this.scene.add(sphereMesh);
    this.animating = true;
    this.animate();
  }

  private async animate() {
    do {
      await this.scene.tick();
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
      await asyncAnimationFrame();
    } while (this.animating);
  }

  private addResizeAction() {
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }
}

new Main().start();
