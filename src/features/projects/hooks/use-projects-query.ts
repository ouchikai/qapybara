"use client";

import { useQuery } from "@tanstack/react-query";

import { redirectToLogin } from "@/features/auth/lib/login-redirect";
import { queryKeys } from "@/lib/react-query/query-keys";
import { apiErrorResponseSchema } from "@/shared/contracts/api-error";

import {
  listProjectsResponseSchema,
  type ProjectSummaryDto,
} from "../schemas/project-summary.schema";

async function fetchProjects(repositoryId: string): Promise<ProjectSummaryDto[]> {
  const response = await fetch(`/api/v1/repositories/${repositoryId}/projects`, {
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
  const parsed = listProjectsResponseSchema.parse(json);

  return parsed.data;
}

export function useProjectsQuery(repositoryId: string, organizationSlug = "default-org") {
  return useQuery({
    queryKey: queryKeys.projects(organizationSlug, repositoryId),
    queryFn: () => fetchProjects(repositoryId),
    enabled: repositoryId.length > 0,
  });
}
