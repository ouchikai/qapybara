"use client";

import { useQuery } from "@tanstack/react-query";

import { redirectToLogin } from "@/features/auth/lib/login-redirect";
import { queryKeys } from "@/lib/react-query/query-keys";
import { apiErrorResponseSchema } from "@/shared/contracts/api-error";

import {
  type IssueSummaryDto,
  issueStatusSchema,
  listIssuesResponseSchema,
} from "../schemas/issue-summary.schema";

export interface UseIssuesQueryFilters {
  status?: string;
  assigneeId?: string;
}

async function fetchIssues(
  projectId: string,
  filters: UseIssuesQueryFilters,
): Promise<IssueSummaryDto[]> {
  const searchParams = new URLSearchParams();

  if (filters.status) {
    searchParams.set("status", issueStatusSchema.parse(filters.status));
  }

  if (filters.assigneeId) {
    searchParams.set("assigneeId", filters.assigneeId);
  }

  const response = await fetch(`/api/v1/projects/${projectId}/issues?${searchParams.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const json: unknown = await response.json();
    const parsedError = apiErrorResponseSchema.parse(json);

    if (response.status === 401) {
      redirectToLogin();
    }

    throw new Error(parsedError.error.message);
  }

  const json: unknown = await response.json();
  const parsed = listIssuesResponseSchema.parse(json);

  return parsed.data;
}

export function useIssuesQuery(
  projectId: string,
  filters: UseIssuesQueryFilters,
  organizationSlug = "default-org",
) {
  return useQuery({
    queryKey: queryKeys.issues(organizationSlug, projectId, {
      status: filters.status,
      assigneeId: filters.assigneeId,
    }),
    queryFn: () => fetchIssues(projectId, filters),
    enabled: projectId.length > 0,
  });
}
