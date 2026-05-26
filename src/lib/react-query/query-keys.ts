export const queryKeys = {
  repositories: (organizationSlug: string) => ["repositories", organizationSlug] as const,
  projects: (organizationSlug: string, repositoryId: string) =>
    ["projects", organizationSlug, repositoryId] as const,
  issues: (
    organizationSlug: string,
    projectId: string,
    filters: { status?: string; assigneeId?: string },
  ) =>
    [
      "issues",
      organizationSlug,
      projectId,
      filters.status ?? "all",
      filters.assigneeId ?? "all",
    ] as const,
};
