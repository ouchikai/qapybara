import type { IssueStatus } from "@/features/issues/types/issue-summary";

export type { IssueStatus } from "@/features/issues/types/issue-summary";

/** 優先度（UI表現は小文字）。DBの IssuePriority enum と対応。 */
export type IssuePriority = "critical" | "high" | "medium" | "low";

/** リスクレベル。DBの RiskLevel enum と対応。 */
export type RiskLevel = "S" | "A" | "B" | "C";

/** バグ重要度（UI表現は小文字）。DBの BugSeverity enum と対応。 */
export type BugSeverity = "critical" | "high" | "medium" | "low";

/** バグステータス（UI表現）。DBの BugStatus enum と対応。 */
export type BugStatus = "new" | "in-progress" | "ready-for-test" | "closed" | "reopened";

/** Issueに紐づく関連バグ（サマリ表示用）。 */
export interface RelatedBug {
  id: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
}

/** AI分析が検出した影響エリア。 */
export interface ImpactArea {
  id: string;
  area: string;
  risk: RiskLevel;
  description: string;
  affectedFeatures: string[];
}

/** AIが生成したテストケース候補。 */
export interface TestCaseSuggestion {
  id: string;
  title: string;
  risk: RiskLevel;
  category: string;
  steps: string[];
}

/** AI影響分析の結果。未分析の場合は null。 */
export interface AiAnalysis {
  id: string;
  createdAt: string;
  impactAreas: ImpactArea[];
  testCaseSuggestions: TestCaseSuggestion[];
}

/** Issue詳細画面が必要とする全データ。 */
export interface IssueDetail {
  id: string;
  projectId: string;
  repositoryId: string;
  repositoryName: string;
  projectName: string;
  externalIssueNumber: number | null;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority | null;
  labels: string[];
  changedFiles: string[];
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
  relatedBugs: RelatedBug[];
  aiAnalysis: AiAnalysis | null;
}
