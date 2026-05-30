import type { Route } from "next";
import { redirect } from "next/navigation";

interface RepositoryProjectTestCasesPageProps {
  params: Promise<{ repositoryId: string; projectId: string }>;
}

/**
 * Backward-compatible route.
 * Project-level test cases path does not have enough context to resolve a specific issue,
 * so we forward users to the project issues list.
 */
export default async function RepositoryProjectTestCasesPage({
  params,
}: RepositoryProjectTestCasesPageProps) {
  const { repositoryId, projectId } = await params;

  redirect(`/repositories/${repositoryId}/projects/${projectId}/issues` as Route);
}
