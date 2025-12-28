import { z } from "zod";

// Position: [longitude, latitude] (GeoJSON standard order)
const PositionSchema = z.tuple([z.number(), z.number()]);

// Polygon coordinates: array of rings (first is outer, rest are holes)
const PolygonCoordinatesSchema = z.array(z.array(PositionSchema));

// MultiPolygon coordinates: array of polygons
const MultiPolygonCoordinatesSchema = z.array(PolygonCoordinatesSchema);

// Geometry types supported for regions
const PolygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: PolygonCoordinatesSchema,
});

const MultiPolygonGeometrySchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: MultiPolygonCoordinatesSchema,
});

const GeoJSONGeometrySchema = z.discriminatedUnion("type", [
  PolygonGeometrySchema,
  MultiPolygonGeometrySchema,
]);

// Generic Feature schema
export function createFeatureSchema<P extends z.ZodTypeAny>(
  propertiesSchema: P,
) {
  return z.object({
    type: z.literal("Feature"),
    properties: propertiesSchema,
    geometry: GeoJSONGeometrySchema,
  });
}

// Generic FeatureCollection schema
export function createFeatureCollectionSchema<F extends z.ZodTypeAny>(
  featureSchema: F,
) {
  return z.object({
    type: z.literal("FeatureCollection"),
    name: z.string().optional(),
    crs: z
      .object({
        type: z.string(),
        properties: z.object({ name: z.string() }),
      })
      .optional(),
    features: z.array(featureSchema),
  });
}

// Type exports
export type Position = z.infer<typeof PositionSchema>;
export type GeoJSONGeometry = z.infer<typeof GeoJSONGeometrySchema>;
