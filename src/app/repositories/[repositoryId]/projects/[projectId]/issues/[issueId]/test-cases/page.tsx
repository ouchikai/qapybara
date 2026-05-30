import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRiskBadgeClassName } from "@/features/issues/lib/risk";
import { IssueDetailService } from "@/features/issues/services/issue-detail.service";
import type { TestCaseSuggestion } from "@/features/issues/types/issue-detail";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { ApiError } from "@/server/http/api-error";

export const dynamic = "force-dynamic";

const service = new IssueDetailService();

interface TestCaseEditorPageProps {
  params: Promise<{ repositoryId: string; projectId: string; issueId: string }>;
  searchParams: Promise<{ suggestions?: string }>;
}

/**
 * Test Case Editor。Issue詳細から引き渡された AI 生成テストケース候補
 * （searchParams の suggestions=ID1,ID2,...）を編集の起点として表示する。
 */
export default async function TestCaseEditorPage({
  params,
  searchParams,
}: TestCaseEditorPageProps) {
  const { repositoryId, projectId, issueId } = await params;
  const { suggestions: suggestionsParam } = await searchParams;

  let analysisSuggestions: TestCaseSuggestion[] = [];
  try {
    const context = await getRequestContext();
    authorize(context.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);
    const detail = await service.getDetail(context.organizationSlug, issueId);
    if (!detail) {
      notFound();
    }
    analysisSuggestions = detail.aiAnalysis?.testCaseSuggestions ?? [];
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const requestedIds = (suggestionsParam ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const selected =
    requestedIds.length > 0
      ? analysisSuggestions.filter((suggestion) => requestedIds.includes(suggestion.id))
      : analysisSuggestions;

  const backHref =
    `/repositories/${repositoryId}/projects/${projectId}/issues/${issueId}` as Route;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Issue
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Test Case Editor</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        AIが生成したテストケース候補（{selected.length}件）
      </p>

      {selected.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          受け取ったテストケース候補がありません。Issue詳細画面でAI影響分析を実行してください。
        </p>
      ) : (
        <ul className="space-y-4">
          {selected.map((suggestion) => (
            <li
              key={suggestion.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-2 py-1 text-xs font-semibold ${getRiskBadgeClassName(suggestion.risk)}`}
                >
                  {suggestion.risk}
                </span>
                <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {suggestion.category}
                </span>
              </div>
              <h2 className="mb-2 font-medium">{suggestion.title}</h2>
              {suggestion.steps.length > 0 ? (
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  {suggestion.steps.map((step, index) => (
                    <li key={`${suggestion.id}-step-${index}`}>{step}</li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
