export interface ProjectSummary {
  id: string;
  repositoryId: string;
  slug: string;
  name: string;
  /** プロジェクトの説明文。DBに未登録の場合はnull */
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ARCHIVED";
  dueDate: string | null;
  openIssues: number;
  testCases: number;
  openBugs: number;
  passRate: number;
}
