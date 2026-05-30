import type { IssueListFilters, IssueSummary } from "@/features/issues/types/issue-summary";

export interface IssueRepository {
  listByProject(
    organizationSlug: string,
    projectId: string,
    filters: IssueListFilters,
  ): Promise<IssueSummary[]>;
}

export class InMemoryIssueRepository implements IssueRepository {
  public async listByProject(
    _: string,
    projectId: string,
    filters: IssueListFilters,
  ): Promise<IssueSummary[]> {
    const issues: IssueSummary[] = [
      {
        id: "issue_123",
        projectId,
        externalIssueNumber: 123,
        title: "ユーザー権限管理の不具合修正",
        status: "OPEN",
        priority: "high",
        labels: ["bug", "security"],
        assigneeId: "user_tanaka",
        assigneeName: "田中太郎",
        createdAt: new Date("2026-05-20T09:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-05-20T09:00:00.000Z").toISOString(),
        testCaseCount: 0,
      },
      {
        id: "issue_124",
        projectId,
        externalIssueNumber: 124,
        title: "取引履歴エクスポート機能の追加",
        status: "IN_PROGRESS",
        priority: "medium",
        labels: ["enhancement", "feature"],
        assigneeId: "user_sato",
        assigneeName: "佐藤花子",
        createdAt: new Date("2026-05-19T10:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-05-24T10:00:00.000Z").toISOString(),
        testCaseCount: 12,
      },
      {
        id: "issue_125",
        projectId,
        externalIssueNumber: 125,
        title: "決済フロー最適化",
        status: "OPEN",
        priority: "critical",
        labels: ["performance", "hotfix"],
        assigneeId: "user_suzuki",
        assigneeName: "鈴木一郎",
        createdAt: new Date("2026-05-22T08:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-05-24T11:00:00.000Z").toISOString(),
        testCaseCount: 5,
      },
    ];

    return issues.filter((issue) => {
      if (filters.status && issue.status !== filters.status) {
        return false;
      }

      if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) {
        return false;
      }

      return true;
    });
  }
}
