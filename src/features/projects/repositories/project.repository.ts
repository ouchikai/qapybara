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
        description: "バージョン2.5のリリース準備",
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
        description: "セキュリティ強化対応",
        status: "ACTIVE",
        dueDate: new Date("2026-06-30T00:00:00.000Z").toISOString(),
        openIssues: 5,
        testCases: 32,
        openBugs: 1,
        passRate: 100,
      },
      {
        id: "project_performance_improvement",
        repositoryId,
        slug: "performance-improvement",
        name: "Performance Improvement",
        description: "パフォーマンス改善",
        status: "PLANNING",
        dueDate: new Date("2026-07-15T00:00:00.000Z").toISOString(),
        openIssues: 2,
        testCases: 15,
        openBugs: 0,
        passRate: 0,
      },
    ];
  }
}
