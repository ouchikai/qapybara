export interface IssueSummary {
  id: string;
  projectId: string;
  externalIssueNumber: number | null;
  title: string;
  status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assigneeId: string | null;
  assigneeName: string | null;
  updatedAt: string;
}

export interface IssueListFilters {
  status?: IssueSummary["status"];
  assigneeId?: string;
}
