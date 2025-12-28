import { useQuery } from "@tanstack/react-query";
import {
  type UkraineGeoJSONFeatureCollection,
  UkraineGeoJSONFeatureCollectionSchema,
} from "../schemas";
import { mapQueryKeys } from "./query-keys";

/**
 * Fetch Ukraine GeoJSON from public folder
 */
async function fetchUkraineGeoJSON(): Promise<UkraineGeoJSONFeatureCollection> {
  const response = await fetch("/geo/ukraine-oblasts.geojson");

  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate with Zod schema
  const result = UkraineGeoJSONFeatureCollectionSchema.safeParse(data);

  if (!result.success) {
    console.error("GeoJSON validation error:", result.error.issues);
    throw new Error("Invalid GeoJSON format");
  }

  return result.data as UkraineGeoJSONFeatureCollection;
}

/**
 * React Query hook for Ukraine GeoJSON data
 * Caches indefinitely since geographic data rarely changes
 */
export function useUkraineGeoJSON() {
  return useQuery({
    queryKey: mapQueryKeys.ukraineGeoJSON(),
    queryFn: fetchUkraineGeoJSON,
    staleTime: Number.POSITIVE_INFINITY, // GeoJSON never goes stale
    gcTime: Number.POSITIVE_INFINITY, // Keep in cache forever
    retry: 2,
    retryDelay: 1000,
  });
}
