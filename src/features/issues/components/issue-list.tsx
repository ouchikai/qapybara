"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  RefreshCw,
  Search,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useIssuesQuery } from "@/features/issues/hooks/use-issues-query";
import type {
  IssuePriority,
  IssueStatus,
  IssueSummary,
} from "@/features/issues/types/issue-summary";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface IssueListProps {
  repositoryId: string;
  projectId: string;
}

interface IssueCardProps {
  issue: IssueSummary;
  repositoryId: string;
  projectId: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * IssueステータスをUIステータスに正規化する。
 * DB側は 5値、UI仕様は open / in-progress / closed の3区分。
 */
function normalizeStatus(status: IssueStatus): "open" | "in-progress" | "closed" {
  if (status === "IN_PROGRESS" || status === "TRIAGED") return "in-progress";
  if (status === "RESOLVED" || status === "CLOSED") return "closed";
  return "open";
}

function getStatusIcon(status: IssueStatus) {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "open":
      return (
        <AlertCircle
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-label="Open"
        />
      );
    case "in-progress":
      return (
        <Clock
          className="mt-0.5 size-4 shrink-0 text-chart-4"
          aria-label="In Progress"
        />
      );
    case "closed":
      return (
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-chart-2"
          aria-label="Closed"
        />
      );
  }
}

/**
 * Priorityバッジのクラス名。仕様書準拠:
 *   critical → destructive系
 *   high     → chart-1系（オレンジ）
 *   medium   → chart-4系（黄色）
 *   low      → muted（グレー）
 */
function getPriorityBadgeClassName(priority: IssuePriority): string {
  switch (priority) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "high":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20";
    case "medium":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "low":
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function createIssueRoute(repositoryId: string, projectId: string, issueId: string): Route {
  return `/repositories/${repositoryId}/projects/${projectId}/issues/${issueId}` as Route;
}

function createTestCasesRoute(
  repositoryId: string,
  projectId: string,
  issueId: string,
): Route {
  return `/repositories/${repositoryId}/projects/${projectId}/issues/${issueId}/test-cases` as Route;
}

// ─────────────────────────────────────────────
// IssueCard
// ─────────────────────────────────────────────

function IssueCard({ issue, repositoryId, projectId }: IssueCardProps) {
  const router = useRouter();

  const issueRoute = createIssueRoute(repositoryId, projectId, issue.id);
  const testCasesRoute = createTestCasesRoute(repositoryId, projectId, issue.id);

  const handleCardClick = useCallback(() => {
    router.push(issueRoute);
  }, [router, issueRoute]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(issueRoute);
      }
    },
    [router, issueRoute],
  );

  const handleTestCasesClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(testCasesRoute);
    },
    [router, testCasesRoute],
  );

  const handleTestCasesKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(testCasesRoute);
      }
    },
    [router, testCasesRoute],
  );

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Issue #${issue.externalIssueNumber ?? "—"}: ${issue.title}`}
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* ── メインコンテンツ行 ── */}
      <div className="flex items-start gap-4">
        {/* ステータスアイコン */}
        <div aria-hidden="true">{getStatusIcon(issue.status)}</div>

        {/* タイトル + バッジ */}
        <div className="min-w-0 flex-1">
          {/* Issue番号 + タイトル */}
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-sm text-muted-foreground" aria-label="Issue番号">
              #{issue.externalIssueNumber ?? "—"}
            </span>
            <h3 className="truncate font-medium text-foreground">{issue.title}</h3>
          </div>

          {/* バッジ行: Priority + Labels */}
          <div
            className="mt-2 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="バッジ"
          >
            {/* Priorityバッジ */}
            {issue.priority !== null && (
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityBadgeClassName(issue.priority)}`}
              >
                {issue.priority}
              </Badge>
            )}

            {/* Labelsバッジ */}
            {issue.labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="border-border bg-accent text-accent-foreground text-xs"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* テストケースボタン（右端） */}
        <div className="shrink-0">
          {issue.testCaseCount > 0 ? (
            <button
              type="button"
              onClick={handleTestCasesClick}
              onKeyDown={handleTestCasesKeyDown}
              aria-label={`${issue.testCaseCount}件のテストケースを表示`}
              className="rounded px-3 py-1 text-xs font-medium bg-chart-2/10 text-chart-2 transition-colors hover:bg-chart-2/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {issue.testCaseCount} test cases →
            </button>
          ) : (
            <span
              className="rounded px-3 py-1 text-xs bg-muted text-muted-foreground"
              aria-label="テストケースなし"
            >
              No test cases
            </span>
          )}
        </div>
      </div>

      {/* ── フッター情報 ── */}
      <div
        className="mt-3 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground"
        aria-label="Issue情報"
      >
        <span>Assignee: {issue.assigneeName ?? "Unassigned"}</span>
        <span>Created: {formatDate(issue.createdAt)}</span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function IssueListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Issueを読み込み中">
      {(["a", "b", "c"] as const).map((key) => (
        <div
          key={`skeleton-${key}`}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-28 rounded" />
          </div>
          <div className="mt-3 flex gap-4 border-t pt-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────

function IssueListEmpty({ searchQuery }: { searchQuery: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center"
      role="status"
    >
      <Inbox className="mb-3 size-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium text-foreground">
        {searchQuery ? "検索結果が見つかりません" : "Issueがありません"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {searchQuery
          ? `"${searchQuery}" に一致するIssueはありませんでした。`
          : "GitHub からIssueを同期するか、新しいIssueを作成してください。"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// IssueList（メインエクスポート）
// ─────────────────────────────────────────────

export function IssueList({ repositoryId, projectId }: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const issuesQuery = useIssuesQuery(projectId, {});

  /**
   * リアルタイム検索フィルタリング。
   * 対象: Issue番号・タイトル・ラベル（大文字小文字を区別しない）
   */
  const filteredIssues = useMemo(() => {
    const issues = issuesQuery.data ?? [];
    if (!searchQuery.trim()) return issues;

    const query = searchQuery.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.externalIssueNumber?.toString() ?? "").includes(query) ||
        issue.labels.some((label) => label.toLowerCase().includes(query)),
    );
  }, [issuesQuery.data, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* ── 検索・フィルターバー ── */}
      <div
        className="flex items-center gap-3"
        role="search"
        aria-label="Issue検索・フィルター"
      >
        {/* 検索入力欄 */}
        <div className="relative flex-1">
          <label htmlFor="issue-search" className="sr-only">
            Issueを検索
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="issue-search"
            type="search"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-9 w-full rounded-md border border-border bg-input-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filtersボタン */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          aria-label="フィルターを開く"
        >
          <Filter className="size-4" aria-hidden="true" />
          Filters
        </Button>
      </div>

      {/* ── コンテンツ ── */}
      {issuesQuery.isLoading ? (
        <IssueListSkeleton />
      ) : issuesQuery.error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">Issueの取得に失敗しました</p>
          </div>
          <p className="mt-1 text-sm text-destructive/80">
            {issuesQuery.error.message}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => void issuesQuery.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            再試行
          </Button>
        </div>
      ) : filteredIssues.length === 0 ? (
        <IssueListEmpty searchQuery={searchQuery} />
      ) : (
        <div
          className="space-y-3"
          role="list"
          aria-label={`${filteredIssues.length}件のIssue`}
        >
          {filteredIssues.map((issue) => (
            <div key={issue.id} role="listitem">
              <IssueCard
                issue={issue}
                repositoryId={repositoryId}
                projectId={projectId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
