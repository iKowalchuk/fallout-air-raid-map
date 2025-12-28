import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates at module load time (build/startup) rather than per-request
 */
const serverEnvSchema = z.object({
  ALERTS_API_URL: z
    .string()
    .url("ALERTS_API_URL must be a valid URL")
    .describe("Base URL for the alerts API"),
  ALERTS_API_TOKEN: z
    .string()
    .min(1, "ALERTS_API_TOKEN is required")
    .describe("Authentication token for the alerts API"),
});

/**
 * Validated server environment variables
 * Will throw at build/startup if env vars are invalid or missing
 */
function validateServerEnv() {
  const result = serverEnvSchema.safeParse({
    ALERTS_API_URL: process.env.ALERTS_API_URL,
    ALERTS_API_TOKEN: process.env.ALERTS_API_TOKEN,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`❌ Invalid environment variables:\n${errors}`);

    // In development, provide helpful error message
    // In production, fail fast
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration");
    }

    // Return empty values for development to allow graceful handling
    return {
      ALERTS_API_URL: process.env.ALERTS_API_URL || "",
      ALERTS_API_TOKEN: process.env.ALERTS_API_TOKEN || "",
      isValid: false,
    };
  }

  return {
    ...result.data,
    isValid: true,
  };
}

export const serverEnv = validateServerEnv();
