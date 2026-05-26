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
        id: "issue_124",
        projectId,
        externalIssueNumber: 124,
        title: "取引履歴エクスポート機能の追加",
        status: "OPEN",
        assigneeId: "user_admin",
        assigneeName: "Admin User",
        updatedAt: new Date("2026-05-24T10:00:00.000Z").toISOString(),
      },
      {
        id: "issue_125",
        projectId,
        externalIssueNumber: 125,
        title: "CSV大量出力の最適化",
        status: "IN_PROGRESS",
        assigneeId: "user_qa",
        assigneeName: "QA User",
        updatedAt: new Date("2026-05-24T11:00:00.000Z").toISOString(),
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
