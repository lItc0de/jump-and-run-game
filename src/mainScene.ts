import {
  Color,
  CylinderGeometry,
  DoubleSide,
  Mesh,
  MeshPhysicalMaterial,
  Scene,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
} from "three";
import HexagonBox, { HexagonType } from "./hexagonBox";
import { createNoise2D } from "simplex-noise";

class MainScene extends Scene {
  private envMap?: Texture;

  async init(envMap: Texture) {
    this.envMap = envMap;
    this.background = new Color("#ffeecc");

    const hexagonBox = new HexagonBox(0, 0, 0, envMap);
    const textures = {
      [HexagonType.DIRT]: await new TextureLoader().loadAsync("dirt.png"),
      [HexagonType.DIRT2]: await new TextureLoader().loadAsync("dirt2.jpg"),
      [HexagonType.GRASS]: await new TextureLoader().loadAsync("grass.jpg"),
      [HexagonType.SAND]: await new TextureLoader().loadAsync("sand.jpg"),
      [HexagonType.STONE]: await new TextureLoader().loadAsync("stone.png"),
      [HexagonType.WATER]: await new TextureLoader().loadAsync("water.jpg"),
    };

    const size = 15;
    const noise2D = createNoise2D();

    for (let i = -size; i <= size; i++) {
      for (let j = -size; j <= size; j++) {
        const position = this.tile2position(i, j);

        if (position.length() > size + 1) continue;

        const height =
          Math.pow((noise2D(i * 0.1, j * 0.1) + 1) * 0.5, 1.5) * 10;
        hexagonBox.addHexagon(height, position);
      }
    }

    for (const geometryMap of hexagonBox.hexagonGeometries) {
      this.add(hexagonBox.getMesh(geometryMap, textures[geometryMap[0]]));
    }

    const seaMesh = new Mesh(
      new CylinderGeometry(size + 2, size + 2, HexagonBox.WATER_HEIGHT, 50),
      new MeshPhysicalMaterial({
        envMap: this.envMap,
        color: new Color("#55aaff").convertSRGBToLinear().multiplyScalar(3),
        ior: 1.4,
        transmission: 1,
        transparent: true,
        thickness: 1.5,
        envMapIntensity: 0.2,
        roughness: 1,
        metalness: 0.025,
        roughnessMap: textures[HexagonType.WATER],
        metalnessMap: textures[HexagonType.WATER],
      })
    );

    seaMesh.receiveShadow = true;
    seaMesh.position.set(0, HexagonBox.MAX_HEIGHT * 0.1, 0);

    this.add(seaMesh);

    const mapContainer = new Mesh(
      new CylinderGeometry(
        size + 2.1,
        size + 2.1,
        HexagonBox.MAX_HEIGHT * 0.2,
        50,
        1,
        true
      ),
      new MeshPhysicalMaterial({
        envMap: this.envMap,
        map: textures[HexagonType.DIRT],
        envMapIntensity: 0.2,
        side: DoubleSide,
      })
    );
    mapContainer.receiveShadow = true;
    mapContainer.position.set(0, HexagonBox.MAX_HEIGHT * 0.1, 0);

    this.add(mapContainer);

    const mapFloor = new Mesh(
      new CylinderGeometry(
        size + 2.1,
        size + 2.1,
        HexagonBox.MAX_HEIGHT * 0.1,
        50
      ),
      new MeshPhysicalMaterial({
        envMap: this.envMap,
        map: textures[HexagonType.DIRT],
        envMapIntensity: 0.2,
        side: DoubleSide,
      })
    );
    mapFloor.receiveShadow = true;
    mapFloor.position.set(0, -HexagonBox.MAX_HEIGHT * 0.05, 0);
    this.add(mapFloor);
  }

  async tick() {}

  private tile2position(tileX: number, tileY: number): Vector2 {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
  }
}

export default MainScene;
