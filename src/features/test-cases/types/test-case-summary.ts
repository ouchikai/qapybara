export type TestCaseStatus = "DRAFT" | "READY" | "PASSED" | "FAILED" | "ARCHIVED";

export interface TestCaseSummary {
  id: string;
  issueId: string;
  title: string;
  status: TestCaseStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  executionCount: number;
  lastExecutionAt: string | null;
  customFieldValues: Record<string, string>;
}

export type CustomFieldType = "DROPDOWN" | "TEXT" | "TEXTAREA";

export interface TestCaseCustomFieldDefinition {
  id: string;
  name: string;
  description: string | null;
  fieldType: CustomFieldType;
  options: string[];
}
