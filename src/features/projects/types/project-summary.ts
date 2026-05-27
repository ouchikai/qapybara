export interface ProjectSummary {
  id: string;
  repositoryId: string;
  slug: string;
  name: string;
  status: "PLANNING" | "ACTIVE" | "ARCHIVED";
  dueDate: string | null;
  openIssues: number;
  testCases: number;
  openBugs: number;
  passRate: number;
}
