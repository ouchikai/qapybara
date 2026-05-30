import type { Route } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { buildLoginRedirectPath } from "@/features/auth/lib/login-redirect";
import { IssueDetailService } from "@/features/issues/services/issue-detail.service";
import type { IssueDetail } from "@/features/issues/types/issue-detail";
import { authorize, getRequestContext } from "@/server/auth/request-context";
import { ApiError } from "@/server/http/api-error";

import { IssueDetailView } from "./issue-detail-view";

// 認証済みユーザー・組織スコープに依存するため毎リクエストで描画する。
export const dynamic = "force-dynamic";

const service = new IssueDetailService();

interface IssueDetailPageProps {
  params: Promise<{ repositoryId: string; projectId: string; issueId: string }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { repositoryId, projectId, issueId } = await params;
  const currentPath = `/repositories/${repositoryId}/projects/${projectId}/issues/${issueId}`;

  let detail: IssueDetail | null;
  try {
    const context = await getRequestContext();
    authorize(context.actorRole, ["owner", "admin", "qa", "developer", "viewer"]);
    detail = await service.getDetail(context.organizationSlug, issueId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
      redirect(buildLoginRedirectPath(currentPath) as Route);
    }
    throw error;
  }

  if (!detail) {
    notFound();
  }

  return <IssueDetailView issue={detail} />;
}
