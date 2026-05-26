import type { RepositorySummary } from "@/features/repositories/types/repository-summary";

export interface RepositoryRepository {
  listSummaries(organizationSlug: string): Promise<RepositorySummary[]>;
}

export class InMemoryRepositoryRepository implements RepositoryRepository {
  public async listSummaries(_: string): Promise<RepositorySummary[]> {
    return [
      {
        id: "1",
        slug: "finance-portal",
        name: "finance-portal",
        activeProjects: 3,
        openIssues: 15,
      },
      {
        id: "2",
        slug: "payment-service",
        name: "payment-service",
        activeProjects: 2,
        openIssues: 8,
      },
      {
        id: "3",
        slug: "user-management",
        name: "user-management",
        activeProjects: 1,
        openIssues: 12,
      },
    ];
  }
}
