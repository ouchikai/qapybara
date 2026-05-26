"use client";

import { useState } from "react";

import { useIssuesQuery } from "@/features/issues/hooks/use-issues-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface IssueListProps {
  projectId: string;
}

const statusOptions = ["", "OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function IssueList({ projectId }: IssueListProps) {
  const [status, setStatus] = useState<string>("");
  const issuesQuery = useIssuesQuery(projectId, { status: status || undefined });

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-muted-foreground">
          Status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option || "all"} value={option}>
              {option || "ALL"}
            </option>
          ))}
        </select>
      </div>

      {issuesQuery.isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : null}

      {issuesQuery.error ? (
        <p className="text-sm text-destructive">{issuesQuery.error.message}</p>
      ) : null}

      {!issuesQuery.isLoading && !issuesQuery.error && (issuesQuery.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No issues found for this filter.</p>
      ) : null}

      {!issuesQuery.isLoading && !issuesQuery.error ? (
        <div className="grid gap-3">
          {(issuesQuery.data ?? []).map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <CardTitle className="text-base">{issue.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>status: {issue.status}</p>
                <p>assignee: {issue.assigneeName ?? "Unassigned"}</p>
                <p>updated: {new Date(issue.updatedAt).toLocaleString("ja-JP")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
