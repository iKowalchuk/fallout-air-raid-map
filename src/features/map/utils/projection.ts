export type Coordinate = [number, number]; // [longitude, latitude]
export type ProjectionFunction = (coords: Coordinate) => Coordinate;

interface ProjectionConfig {
  centerLon: number;
  centerLat: number;
  scale: number;
  width: number;
  height: number;
}

/**
 * Convert latitude to Mercator y value
 */
function latToMercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

/**
 * Creates a simple Mercator projection function
 * Converts WGS84 lat/lon to SVG x/y coordinates
 */
function createMercatorProjection(
  config: ProjectionConfig,
): ProjectionFunction {
  const { centerLon, centerLat, scale, width, height } = config;

  // Pre-calculate center projection for offset
  const centerY = latToMercatorY(centerLat);

  return ([lon, lat]: Coordinate): Coordinate => {
    // Mercator projection formula
    // Convert longitude to radians for consistent scaling
    const lonRad = (lon * Math.PI) / 180;
    const centerLonRad = (centerLon * Math.PI) / 180;

    const x = (lonRad - centerLonRad) * scale;
    const y = -(latToMercatorY(lat) - centerY) * scale;

    // Center in viewBox
    return [x + width / 2, y + height / 2];
  };
}

/**
 * Pre-configured projection for Ukraine
 * Optimized to fit Ukraine in a 780x680 viewBox
 *
 * Ukraine bounds: lon 22.14-40.23, lat 44.39-52.37
 * Center approximately: lon 31.18, lat 48.38
 */
export const ukraineProjection = createMercatorProjection({
  centerLon: 31.2,
  centerLat: 48.4,
  scale: 2400, // Scale factor calibrated for 780x680 viewBox
  width: 780,
  height: 680,
});
