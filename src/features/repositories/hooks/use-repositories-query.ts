"use client";

import { useQuery } from "@tanstack/react-query";

import { redirectToLogin } from "@/features/auth/lib/login-redirect";
import { queryKeys } from "@/lib/react-query/query-keys";
import { apiErrorResponseSchema } from "@/shared/contracts/api-error";

import {
  listRepositoriesResponseSchema,
  type RepositorySummaryDto,
} from "../schemas/repository-summary.schema";

async function fetchRepositories(): Promise<RepositorySummaryDto[]> {
  const response = await fetch("/api/v1/repositories", {
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
  const parsed = listRepositoriesResponseSchema.parse(json);

  return parsed.data;
}

export function useRepositoriesQuery() {
  return useQuery({
    queryKey: queryKeys.repositories("default-org"),
    queryFn: fetchRepositories,
  });
}
