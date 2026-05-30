"use client";

import {
  AlertTriangle,
  Bug as BugIcon,
  ChevronRight,
  FileCode,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { analyzeIssue } from "@/app/actions/analyze-issue";
import { getPriorityBadgeClassName, getSeverityBadgeClassName } from "@/features/issues/lib/risk";
import type { AiAnalysis, IssueDetail } from "@/features/issues/types/issue-detail";

import { BugReportDialog } from "./bug-report-dialog";
import { ImpactAreasSection } from "./impact-areas-section";
import { TestCaseSuggestionsSection } from "./test-case-suggestions-section";

interface IssueDetailViewProps {
  issue: IssueDetail;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function IssueDetailView({ issue }: IssueDetailViewProps) {
  const router = useRouter();
  const [isAnalyzing, startAnalyze] = useTransition();
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(issue.aiAnalysis);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isBugDialogOpen, setBugDialogOpen] = useState(false);

  const basePath = `/repositories/${issue.repositoryId}/projects/${issue.projectId}/issues/${issue.id}`;
  const testCasesPath = `${basePath}/test-cases`;
  const bugsPath =
    `/repositories/${issue.repositoryId}/projects/${issue.projectId}/bugs` as Route;

  const handleAnalyze = useCallback(() => {
    setAnalyzeError(null);
    startAnalyze(async () => {
      const result = await analyzeIssue(issue.id);
      if (!result.ok || !result.analysis) {
        setAnalyzeError(result.error ?? "分析に失敗しました");
        return;
      }
      setAnalysis(result.analysis);
      router.refresh();
    });
  }, [issue.id, router]);

  const handleBugCreated = useCallback(() => {
    setBugDialogOpen(false);
    router.refresh();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href={"/repositories" as Route} className="hover:text-foreground">
                Repositories
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <li>
              <Link
                href={`/repositories/${issue.repositoryId}/projects` as Route}
                className="hover:text-foreground"
              >
                {issue.repositoryName}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <li>
              <Link
                href={
                  `/repositories/${issue.repositoryId}/projects/${issue.projectId}/issues` as Route
                }
                className="hover:text-foreground"
              >
                {issue.projectName}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <li aria-current="page" className="font-medium text-foreground">
              Issue #{issue.externalIssueNumber ?? "—"}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="shrink-0 text-sm text-muted-foreground">
                #{issue.externalIssueNumber ?? "—"}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight">{issue.title}</h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-muted-foreground">
                {issue.status}
              </span>
              {issue.priority !== null ? (
                <span
                  className={`rounded-md border px-2 py-0.5 font-medium ${getPriorityBadgeClassName(issue.priority)}`}
                >
                  {issue.priority}
                </span>
              ) : null}
              {issue.assigneeName ? (
                <span className="text-muted-foreground">担当: {issue.assigneeName}</span>
              ) : null}
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-border bg-accent px-2 py-0.5 text-accent-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setBugDialogOpen(true)}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BugIcon className="size-4" aria-hidden="true" />
              Report Bug
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isAnalyzing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              {isAnalyzing ? "Analyzing..." : "AI Impact Analysis"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2">
          {/* Left: Issue detail */}
          <div className="space-y-6">
            <section
              aria-labelledby="description-heading"
              className="rounded-lg border border-border bg-card p-4"
            >
              <h2 id="description-heading" className="mb-3 text-base font-semibold">
                Description
              </h2>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
                {issue.description}
              </pre>
            </section>

            <section
              aria-labelledby="files-heading"
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <FileCode className="size-5 text-muted-foreground" aria-hidden="true" />
                <h2 id="files-heading" className="text-base font-semibold">
                  Changed Files
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({issue.changedFiles.length})
                </span>
              </div>
              {issue.changedFiles.length > 0 ? (
                <ul className="space-y-2">
                  {issue.changedFiles.map((file) => (
                    <li
                      key={file}
                      className="rounded border border-border bg-muted px-3 py-2 font-mono text-sm text-muted-foreground"
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">変更ファイルはありません。</p>
              )}
            </section>

            {issue.relatedBugs.length > 0 ? (
              <section
                aria-labelledby="bugs-heading"
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BugIcon className="size-5 text-destructive" aria-hidden="true" />
                    <h2 id="bugs-heading" className="text-base font-semibold">
                      Related Bugs
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({issue.relatedBugs.length})
                    </span>
                  </div>
                  <Link href={bugsPath} className="text-sm text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <ul className="space-y-2">
                  {issue.relatedBugs.map((bug) => (
                    <li key={bug.id}>
                      <Link
                        href={bugsPath}
                        className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/50 p-3 transition-colors hover:bg-muted"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <AlertTriangle
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm">{bug.title}</span>
                        </div>
                        <span
                          className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${getSeverityBadgeClassName(bug.severity)}`}
                        >
                          {bug.severity}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {/* Right: AI analysis */}
          <div className="space-y-6">
            {analyzeError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {analyzeError}
              </p>
            ) : null}

            {isAnalyzing ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Loader2
                  className="mx-auto mb-4 size-8 animate-spin text-primary"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground">Analyzing code changes and impact...</p>
              </div>
            ) : analysis ? (
              <>
                <ImpactAreasSection impactAreas={analysis.impactAreas} />
                <TestCaseSuggestionsSection
                  suggestions={analysis.testCaseSuggestions}
                  testCasesPath={testCasesPath}
                />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <Sparkles
                  className="mx-auto mb-4 size-12 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-muted-foreground">
                  Click &quot;AI Impact Analysis&quot; to analyze impact areas and generate test
                  cases
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BugReportDialog
        open={isBugDialogOpen}
        issueId={issue.id}
        issueNumber={issue.externalIssueNumber}
        issueTitle={issue.title}
        onClose={() => setBugDialogOpen(false)}
        onCreated={handleBugCreated}
      />
    </div>
  );
}
