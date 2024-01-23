import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Camera,
  Clock,
  Group,
  Mesh,
} from "three";
import {
  GLTF,
  GLTFLoader,
  OrbitControls,
  PointerLockControls,
} from "three/examples/jsm/Addons.js";
import PlayerControls from "./playerControls";

class Player {
  private gltf?: GLTF;
  private gltfAnimations?: AnimationClip[];
  private mixer?: AnimationMixer;
  private controls?: PlayerControls;
  private animationsMap = new Map<string, AnimationAction>();
  private pointerControls: PointerLockControls;
  private camera: Camera;

  model?: Group;

  constructor(pointerControls: PointerLockControls, camera: Camera) {
    this.pointerControls = pointerControls;
    this.camera = camera;
  }

  async init() {
    const loader = new GLTFLoader();
    this.gltf = await loader.loadAsync("models/Soldier.glb");
    this.model = this.gltf.scene;

    if (!this.model) return;

    this.model.position.set(0, 8, 15);
    // const scale = 0.4;
    // this.model.scale.set(scale, scale, scale);
    this.model.traverse((object: Mesh | any) => {
      if (!object.isMesh) return;
      const mesh = object as Mesh;
      mesh.castShadow = true;
    });

    this.gltfAnimations = this.gltf.animations;
    this.mixer = new AnimationMixer(this.model);

    this.gltfAnimations
      .filter((animation) => animation.name !== "TPose")
      .forEach((animation) => {
        if (this.mixer === undefined) return;

        // console.log(animation.name);

        this.animationsMap.set(
          animation.name,
          this.mixer.clipAction(animation)
        );
      });

    this.controls = new PlayerControls(
      this.model,
      this.mixer,
      this.pointerControls,
      this.camera,
      this.animationsMap,
      "Idle"
    );
  }

  update(clock: Clock) {
    const mixerUpdateDelta = clock.getDelta();
    if (this.controls) this.controls.update(mixerUpdateDelta);
  }
}

export default Player;
