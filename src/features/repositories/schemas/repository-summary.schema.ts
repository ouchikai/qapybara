import { z } from "zod";

export const repositorySummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  activeProjects: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
});

export const listRepositoriesResponseSchema = z.object({
  data: z.array(repositorySummarySchema),
});

export type RepositorySummaryDto = z.infer<typeof repositorySummarySchema>;
export type ListRepositoriesResponseDto = z.infer<typeof listRepositoriesResponseSchema>;
