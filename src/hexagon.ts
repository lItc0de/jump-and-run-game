import { CylinderGeometry } from "three";
import { HexagonType } from "./hexagonBox";

class Hexagon {
  type: HexagonType;
  geometry: CylinderGeometry;

  constructor(
    type: HexagonType,
    height: number,
    position: { x: number; y: number }
  ) {
    this.type = type;
    this.geometry = new CylinderGeometry(1, 1, height, 6, 1, false);
    this.geometry.translate(position.x, height * 0.5, position.y);
  }
}

export default Hexagon;
