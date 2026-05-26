import { z } from "zod";

export const healthResponseSchema = z.object({
  ok: z.boolean(),
  timestamp: z.iso.datetime(),
  service: z.literal("qapybara-api"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
