import { z } from "zod";

export const testCaseStatusSchema = z.enum(["DRAFT", "READY", "PASSED", "FAILED", "ARCHIVED"]);

export const customFieldTypeSchema = z.enum(["DROPDOWN", "TEXT", "TEXTAREA"]);

export const testCaseSummarySchema = z.object({
  id: z.string().min(1),
  issueId: z.string().min(1),
  title: z.string().min(1),
  status: testCaseStatusSchema,
  assigneeId: z.string().nullable(),
  assigneeName: z.string().nullable(),
  executionCount: z.number().int().nonnegative(),
  lastExecutionAt: z.iso.datetime().nullable(),
  customFieldValues: z.record(z.string(), z.string()),
});

export const testCaseCustomFieldDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  fieldType: customFieldTypeSchema,
  options: z.array(z.string()),
});

export const listTestCasesResponseSchema = z.object({
  data: z.object({
    customFieldDefinitions: z.array(testCaseCustomFieldDefinitionSchema),
    testCases: z.array(testCaseSummarySchema),
  }),
});

export type ListTestCasesResponseDto = z.infer<typeof listTestCasesResponseSchema>;
