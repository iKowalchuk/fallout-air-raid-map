import type { GeoJSONGeometry, Position } from "../schemas";
import type { Coordinate, ProjectionFunction } from "./projection";

/**
 * Convert a ring of coordinates to SVG path commands
 */
function ringToPath(ring: Position[], projection: ProjectionFunction): string {
  if (ring.length === 0) return "";

  const projected = ring.map((pos) => projection(pos as Coordinate));
  const [firstX, firstY] = projected[0];
  let path = `M${firstX.toFixed(1)},${firstY.toFixed(1)}`;

  for (let i = 1; i < projected.length; i++) {
    const [x, y] = projected[i];
    path += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }

  path += " Z"; // Close path
  return path;
}

/**
 * Convert GeoJSON Polygon to SVG path
 * Handles outer ring and holes
 */
function polygonToPath(
  coordinates: Position[][],
  projection: ProjectionFunction,
): string {
  // First ring is exterior, rest are holes
  return coordinates.map((ring) => ringToPath(ring, projection)).join(" ");
}

/**
 * Convert GeoJSON MultiPolygon to SVG path
 */
function multiPolygonToPath(
  coordinates: Position[][][],
  projection: ProjectionFunction,
): string {
  return coordinates
    .map((polygon) => polygonToPath(polygon, projection))
    .join(" ");
}

/**
 * Convert any GeoJSON geometry to SVG path string
 */
export function geoJSONToSVGPath(
  geometry: GeoJSONGeometry,
  projection: ProjectionFunction,
): string {
  switch (geometry.type) {
    case "Polygon":
      return polygonToPath(geometry.coordinates, projection);
    case "MultiPolygon":
      return multiPolygonToPath(geometry.coordinates, projection);
    default:
      console.warn(
        `Unsupported geometry type: ${(geometry as { type: string }).type}`,
      );
      return "";
  }
}
