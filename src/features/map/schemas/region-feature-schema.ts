import { z } from "zod";
import {
  createFeatureCollectionSchema,
  createFeatureSchema,
  type GeoJSONGeometry,
} from "./geojson-schema";

// Ukraine-specific feature properties from the GeoJSON file
const UkraineFeaturePropertiesSchema = z.object({
  fid: z.number(),
  region: z.string(), // Ukrainian region name
});

// Feature with Ukraine-specific properties
const UkraineGeoJSONFeatureSchema = createFeatureSchema(
  UkraineFeaturePropertiesSchema,
);

// FeatureCollection for Ukraine oblasts
const UkraineGeoJSONFeatureCollectionSchema = createFeatureCollectionSchema(
  UkraineGeoJSONFeatureSchema,
);

// Export for validation
export { UkraineGeoJSONFeatureCollectionSchema };

// Type exports
export type UkraineFeatureProperties = z.infer<
  typeof UkraineFeaturePropertiesSchema
>;

export type UkraineGeoJSONFeature = {
  type: "Feature";
  properties: UkraineFeatureProperties;
  geometry: GeoJSONGeometry;
};

export type UkraineGeoJSONFeatureCollection = {
  type: "FeatureCollection";
  name?: string;
  crs?: { type: string; properties: { name: string } };
  features: UkraineGeoJSONFeature[];
};
