/** DBスキーマに存在するステータス値 */
export type IssueStatus = "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

/**
 * 優先度。DBスキーマ未定義のため、現時点では null を許容する。
 * 将来マイグレーション追加後に non-nullable に変更予定。
 */
export type IssuePriority = "critical" | "high" | "medium" | "low";

export interface IssueSummary {
  id: string;
  projectId: string;
  externalIssueNumber: number | null;
  title: string;
  status: IssueStatus;
  /** 優先度。DBスキーマ未定義時は null */
  priority: IssuePriority | null;
  /** ラベル一覧。DBスキーマ未定義時は空配列 */
  labels: string[];
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
  /** 紐づくテストケース数 */
  testCaseCount: number;
}

export interface IssueListFilters {
  status?: IssueSummary["status"];
  assigneeId?: string;
}
