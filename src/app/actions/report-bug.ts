"use server";

import { revalidatePath } from "next/cache";

import { reportBugInputSchema } from "@/features/issues/schemas/issue-detail.schema";
import { IssueDetailService } from "@/features/issues/services/issue-detail.service";
import type { RelatedBug } from "@/features/issues/types/issue-detail";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { ApiError } from "@/server/http/api-error";

const ISSUE_DETAIL_PATH =
  "/repositories/[repositoryId]/projects/[projectId]/issues/[issueId]";

const service = new IssueDetailService();

export type ReportBugFieldErrors = Partial<
  Record<"title" | "description" | "severity" | "issueId", string>
>;

export interface ReportBugResult {
  ok: boolean;
  bug?: RelatedBug;
  error?: string;
  fieldErrors?: ReportBugFieldErrors;
}

/**
 * バグを登録するServer Action。入力をzodで検証し、組織スコープで作成する。
 */
export async function reportBug(input: unknown): Promise<ReportBugResult> {
  const parsed = reportBugInputSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: ReportBugFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (
        (key === "title" || key === "description" || key === "severity" || key === "issueId") &&
        !fieldErrors[key]
      ) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "入力内容を確認してください", fieldErrors };
  }

  try {
    const context = await getRequestContext();
    authorize(context.actorRole, ["owner", "admin", "qa", "developer"]);

    const bug = await service.createBug(context.organizationSlug, parsed.data);

    revalidatePath(ISSUE_DETAIL_PATH, "page");

    return { ok: true, bug };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    console.error("reportBug failed", error);
    return { ok: false, error: "バグの登録に失敗しました" };
  }
}
