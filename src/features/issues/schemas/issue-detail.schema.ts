import { z } from "zod";

import { issueStatusSchema } from "@/features/issues/schemas/issue-summary.schema";

export const issuePrioritySchema = z.enum(["critical", "high", "medium", "low"]);
export const riskLevelSchema = z.enum(["S", "A", "B", "C"]);
export const bugSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export const bugStatusSchema = z.enum([
  "new",
  "in-progress",
  "ready-for-test",
  "closed",
  "reopened",
]);

export const relatedBugSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  severity: bugSeveritySchema,
  status: bugStatusSchema,
});

export const impactAreaSchema = z.object({
  id: z.string().min(1),
  area: z.string().min(1),
  risk: riskLevelSchema,
  description: z.string(),
  affectedFeatures: z.array(z.string()),
});

export const testCaseSuggestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  risk: riskLevelSchema,
  category: z.string().min(1),
  steps: z.array(z.string()),
});

export const aiAnalysisSchema = z.object({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  impactAreas: z.array(impactAreaSchema),
  testCaseSuggestions: z.array(testCaseSuggestionSchema),
});

export const issueDetailSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  repositoryId: z.string().min(1),
  repositoryName: z.string(),
  projectName: z.string(),
  externalIssueNumber: z.number().int().nullable(),
  title: z.string().min(1),
  description: z.string(),
  status: issueStatusSchema,
  priority: issuePrioritySchema.nullable(),
  labels: z.array(z.string()),
  changedFiles: z.array(z.string()),
  assigneeId: z.string().nullable(),
  assigneeName: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  relatedBugs: z.array(relatedBugSchema),
  aiAnalysis: aiAnalysisSchema.nullable(),
});

/** Report Bug フォームの入力スキーマ（Server Actionで使用）。 */
export const reportBugInputSchema = z.object({
  issueId: z.string().min(1),
  title: z.string().trim().min(1, "タイトルは必須です").max(200, "200文字以内で入力してください"),
  description: z.string().trim().min(1, "説明は必須です"),
  severity: bugSeveritySchema,
});

export type IssueDetailDto = z.infer<typeof issueDetailSchema>;
export type AiAnalysisDto = z.infer<typeof aiAnalysisSchema>;
export type ReportBugInput = z.infer<typeof reportBugInputSchema>;
