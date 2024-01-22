import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Texture,
} from "three";
import Hexagon from "./hexagon";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export enum HexagonType {
  STONE,
  DIRT,
  DIRT2,
  GRASS,
  SAND,
  WATER,
}

class HexagonBox {
  static MAX_HEIGHT = 10;
  static STONE_HEIGHT = HexagonBox.MAX_HEIGHT * 0.8;
  static DIRT2_HEIGHT = HexagonBox.MAX_HEIGHT * 0.7;
  static GRASS_HEIGHT = HexagonBox.MAX_HEIGHT * 0.5;
  static SAND_HEIGHT = HexagonBox.MAX_HEIGHT * 0.3;
  static WATER_HEIGHT = HexagonBox.MAX_HEIGHT * 0.2;
  static DIRT_HEIGHT = HexagonBox.MAX_HEIGHT * 0;

  hexagonGeometries = new Map<HexagonType, BoxGeometry>();
  envMap: Texture;

  constructor(x: number, y: number, z: number, envMap: Texture) {
    this.envMap = envMap;

    this.hexagonGeometries.set(HexagonType.STONE, new BoxGeometry(x, y, z));
    this.hexagonGeometries.set(HexagonType.DIRT, new BoxGeometry(x, y, z));
    this.hexagonGeometries.set(HexagonType.DIRT2, new BoxGeometry(x, y, z));
    this.hexagonGeometries.set(HexagonType.GRASS, new BoxGeometry(x, y, z));
    this.hexagonGeometries.set(HexagonType.SAND, new BoxGeometry(x, y, z));
    // this.hexagonGeometries.set(HexagonType.WATER, new BoxGeometry(x, y, z));
  }

  addHexagon(height: number, position: { x: number; y: number }) {
    let type;

    if (height >= HexagonBox.STONE_HEIGHT) {
      type = HexagonType.STONE;
    } else if (height >= HexagonBox.DIRT2_HEIGHT) {
      type = HexagonType.DIRT2;
    } else if (height >= HexagonBox.GRASS_HEIGHT) {
      type = HexagonType.GRASS;
    } else if (height >= HexagonBox.SAND_HEIGHT) {
      type = HexagonType.SAND;
      // } else if (height >= HexagonBox.WATER_HEIGHT) {
      //   type = HexagonType.WATER;
    } else {
      type = HexagonType.DIRT;
    }

    const newHexagon = new Hexagon(type, height, position);
    const geometry = this.hexagonGeometries.get(type);
    if (!geometry) return;

    this.hexagonGeometries.set(
      type,
      // @ts-ignore
      mergeBufferGeometries([geometry, newHexagon.geometry])
    );

    if (
      (type === HexagonType.STONE || type === HexagonType.SAND) &&
      Math.random() > 0.8
    ) {
      const stoneGeometry = this.hexagonGeometries.get(HexagonType.STONE);
      if (!stoneGeometry) return;

      this.hexagonGeometries.set(
        HexagonType.STONE,
        // @ts-ignore
        mergeBufferGeometries([
          stoneGeometry,
          this.createStone(height, position),
        ])
      );
    }
  }

  getMesh(geometryMap: [HexagonType, BoxGeometry], map: Texture): Mesh {
    const mesh = new Mesh(
      geometryMap[1],
      new MeshStandardMaterial({
        envMap: this.envMap,
        // envMapIntensity: 1,
        envMapIntensity: 0.135,
        flatShading: true,
        map,
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  private createStone(
    height: number,
    position: { x: number; y: number }
  ): SphereGeometry {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;
    const stoneGeo = new SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
    stoneGeo.translate(position.x + px, height, position.y + pz);

    return stoneGeo;
  }
}

export default HexagonBox;
