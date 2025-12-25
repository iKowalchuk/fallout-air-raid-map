import { z } from "zod";

export const RegionSchema = z.object({
  id: z.string(),
  nameUa: z.string().min(1),
  nameEn: z.string().min(1),
  position: z.enum(["left", "right"]),
});

export type Region = z.infer<typeof RegionSchema>;
