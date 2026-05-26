import { z } from "zod";

export const issueStatusSchema = z.enum(["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

export const issueSummarySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  externalIssueNumber: z.number().int().nullable(),
  title: z.string().min(1),
  status: issueStatusSchema,
  assigneeId: z.string().nullable(),
  assigneeName: z.string().nullable(),
  updatedAt: z.iso.datetime(),
});

export const listIssuesQuerySchema = z.object({
  status: issueStatusSchema.optional(),
  assigneeId: z.string().min(1).optional(),
});

export const listIssuesResponseSchema = z.object({
  data: z.array(issueSummarySchema),
});

export type IssueSummaryDto = z.infer<typeof issueSummarySchema>;
export type IssueListQueryDto = z.infer<typeof listIssuesQuerySchema>;
export type ListIssuesResponseDto = z.infer<typeof listIssuesResponseSchema>;
