"use server";

import { revalidatePath } from "next/cache";

import { IssueDetailService } from "@/features/issues/services/issue-detail.service";
import type { AiAnalysis } from "@/features/issues/types/issue-detail";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { ApiError } from "@/server/http/api-error";

const ISSUE_DETAIL_PATH =
  "/repositories/[repositoryId]/projects/[projectId]/issues/[issueId]";

const service = new IssueDetailService();

export interface AnalyzeIssueResult {
  ok: boolean;
  analysis?: AiAnalysis;
  error?: string;
}

/**
 * AI影響分析を実行するServer Action。
 *
 * （モック）分析を生成してDBへ永続化し、結果を返す。冪等で、既存の分析が
 * あれば再生成する。永続化後に詳細ページを再検証する。
 */
export async function analyzeIssue(issueId: string): Promise<AnalyzeIssueResult> {
  if (!issueId || typeof issueId !== "string") {
    return { ok: false, error: "Issue IDが不正です" };
  }

  try {
    const context = await getRequestContext();
    authorize(context.actorRole, ["owner", "admin", "qa", "developer"]);

    const analysis = await service.regenerateAnalysis(context.organizationSlug, issueId);

    revalidatePath(ISSUE_DETAIL_PATH, "page");

    return { ok: true, analysis };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    console.error("analyzeIssue failed", error);
    return { ok: false, error: "分析の実行に失敗しました" };
  }
}
