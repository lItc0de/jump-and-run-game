import {
  AnimationAction,
  AnimationMixer,
  Camera,
  Group,
  Quaternion,
  Vector3,
} from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";

const FADE_DURATION = 0.2;
const VELOCITY = 5;

const DIRECTIONS = ["w", "a", "s", "d"];
enum DIRECTION_MAP {
  up = "w",
  left = "a",
  down = "s",
  right = "d",
}

class PlayerControls {
  private keyPressed = new Map<string, boolean>();
  private toggleRun = true;
  private currentAction: string;

  private walkDirection = new Vector3();
  private rotateAngle = new Vector3(0, 1, 0);
  private rotateQuaternion = new Quaternion();
  private cameraTarget = new Vector3();

  private model: Group;
  private mixer: AnimationMixer;
  private animationsMap: Map<string, AnimationAction>;
  private pointerControls: PointerLockControls;
  private camera: Camera;

  constructor(
    model: Group,
    mixer: AnimationMixer,
    pointerControls: PointerLockControls,
    camera: Camera,
    animationsMap: Map<string, AnimationAction>,
    currentAction: string
  ) {
    this.model = model;
    this.mixer = mixer;
    this.pointerControls = pointerControls;
    this.camera = camera;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    const animation = this.animationsMap.get(this.currentAction);

    animation?.play();

    console.log(this.animationsMap);

    this.addEventListeners();
  }

  switchToggleRun() {
    this.toggleRun = !this.toggleRun;
  }

  update(delta: number) {
    const directionPressed = DIRECTIONS.some((key) => this.keyPressed.get(key));

    let newAnimationAction = "Idle";

    if (directionPressed) {
      newAnimationAction = "Run";
      this.updateWalkingDirection();
      this.move(delta);
    }

    if (this.currentAction !== newAnimationAction) {
      const toPlay = this.animationsMap.get(newAnimationAction);
      const current = this.animationsMap.get(this.currentAction);

      if (!toPlay || !current) return;

      current.fadeOut(FADE_DURATION);
      toPlay.reset().fadeIn(FADE_DURATION).play();

      this.currentAction = newAnimationAction;
    }

    this.mixer.update(delta);
  }

  private updateCameraTarget(moveX: number, moveZ: number) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    this.cameraTarget.x = this.model.position.x;
    this.cameraTarget.y = this.model.position.y + 1;
    this.cameraTarget.z = this.model.position.z;
    // this.pointerControls.target = this.cameraTarget;

    this.pointerControls.moveForward;
  }

  private move(delta: number) {
    const moveX = this.walkDirection.x * VELOCITY * delta;
    const moveZ = this.walkDirection.z * VELOCITY * delta;
    this.model.position.x += moveX;
    this.model.position.z += moveZ;

    this.updateCameraTarget(moveX, moveZ);
  }

  private updateWalkingDirection() {
    const angleYCameraDirection = Math.atan2(
      this.camera.position.x - this.model.position.x,
      this.camera.position.z - this.model.position.z
    );

    const directionOffest = this.calculateDirectionOffset();

    this.rotateQuaternion.setFromAxisAngle(
      this.rotateAngle,
      angleYCameraDirection + directionOffest
    );
    this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);

    this.camera.getWorldDirection(this.walkDirection);
    this.walkDirection.y = 0;
    this.walkDirection.normalize();
    this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffest);
  }

  private calculateDirectionOffset(): number {
    let directionOffset = 0; // w

    if (this.keyPressed.get("w")) {
      if (this.keyPressed.get("a")) {
        directionOffset = Math.PI / 4; // w + a
      } else if (this.keyPressed.get("d")) {
        directionOffset = -Math.PI / 4; // w + d
      }
    } else if (this.keyPressed.get("s")) {
      if (this.keyPressed.get("a")) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s + a
      } else if (this.keyPressed.get("d")) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s + d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (this.keyPressed.get("a")) {
      directionOffset = Math.PI / 2; // a
    } else if (this.keyPressed.get("d")) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  }

  private addEventListeners() {
    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);
    this.pointerControls.addEventListener("change", this.handlePointerChange);
  }

  private handlePointerChange = (event: any) => {
    console.log(event);

    // const direction = this.pointerControls.getDirection(this.model.position);
    // console.log(direction);
    // const angleYCameraDirection = Math.atan2(
    //   this.camera.position.x - this.model.position.x,
    //   this.camera.position.z - this.model.position.z
    // );
    // this.rotateQuaternion.setFromAxisAngle(direction, angleYCameraDirection);
    // this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);
  };

  private keyDownHandler = (event: KeyboardEvent) => {
    this.keyPressed.set(event.key.toLowerCase(), true);
  };

  private keyUpHandler = (event: KeyboardEvent) => {
    this.keyPressed.set(event.key.toLowerCase(), false);
  };
}

export default PlayerControls;
