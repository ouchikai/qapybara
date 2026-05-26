import { z } from "zod";

export const projectStatusSchema = z.enum(["PLANNING", "ACTIVE", "ARCHIVED"]);

export const projectSummarySchema = z.object({
  id: z.string().min(1),
  repositoryId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  status: projectStatusSchema,
  dueDate: z.iso.datetime().nullable(),
  openIssues: z.number().int().nonnegative(),
});

export const listProjectsResponseSchema = z.object({
  data: z.array(projectSummarySchema),
});

export type ProjectSummaryDto = z.infer<typeof projectSummarySchema>;
export type ListProjectsResponseDto = z.infer<typeof listProjectsResponseSchema>;
