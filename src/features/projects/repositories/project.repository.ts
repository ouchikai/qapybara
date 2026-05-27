import type { ProjectSummary } from "@/features/projects/types/project-summary";

export interface ProjectRepository {
  listByRepository(organizationSlug: string, repositoryId: string): Promise<ProjectSummary[]>;
}

export class InMemoryProjectRepository implements ProjectRepository {
  public async listByRepository(_: string, repositoryId: string): Promise<ProjectSummary[]> {
    return [
      {
        id: "project_v2_5_release",
        repositoryId,
        slug: "v2-5-release",
        name: "v2.5 Release",
        status: "ACTIVE",
        dueDate: new Date("2026-06-15T00:00:00.000Z").toISOString(),
        openIssues: 8,
        testCases: 45,
        openBugs: 4,
        passRate: 92,
      },
      {
        id: "project_security_enhancement",
        repositoryId,
        slug: "security-enhancement",
        name: "Security Enhancement",
        status: "PLANNING",
        dueDate: new Date("2026-06-30T00:00:00.000Z").toISOString(),
        openIssues: 3,
        testCases: 32,
        openBugs: 2,
        passRate: 88,
      },
    ];
  }
}
