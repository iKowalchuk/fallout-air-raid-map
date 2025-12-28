export const mapQueryKeys = {
  all: ["map"] as const,
  geoJSON: (resource: string) => ["map", "geojson", resource] as const,
  ukraineGeoJSON: () => ["map", "geojson", "ukraine-oblasts"] as const,
};
