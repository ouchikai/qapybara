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
  testCases: z.number().int().nonnegative(),
  openBugs: z.number().int().nonnegative(),
  passRate: z.number().int().min(0).max(100),
});

export const listProjectsResponseSchema = z.object({
  data: z.array(projectSummarySchema),
});

export type ProjectSummaryDto = z.infer<typeof projectSummarySchema>;
export type ListProjectsResponseDto = z.infer<typeof listProjectsResponseSchema>;
