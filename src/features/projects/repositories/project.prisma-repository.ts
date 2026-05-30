import { BugStatus, IssueStatus, ProjectStatus, TestCaseStatus } from "@prisma/client";

import type { ProjectSummary } from "@/features/projects/types/project-summary";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

import type { ProjectRepository } from "./project.repository";

const openIssueStatuses: IssueStatus[] = [
  IssueStatus.OPEN,
  IssueStatus.TRIAGED,
  IssueStatus.IN_PROGRESS,
];

export class PrismaProjectRepository implements ProjectRepository {
  public async listByRepository(
    organizationSlug: string,
    repositoryId: string,
  ): Promise<ProjectSummary[]> {
    const repository = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        deletedAt: null,
        organization: {
          slug: organizationSlug,
          deletedAt: null,
        },
      },
      select: {
        id: true,
      },
    });

    if (!repository) {
      throw new ApiError("NOT_FOUND", "Repository was not found");
    }

    const projects = await prisma.project.findMany({
      where: {
        repositoryId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            issues: {
              where: {
                deletedAt: null,
                status: {
                  in: openIssueStatuses,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (projects.length === 0) {
      return [];
    }

    const projectIds = projects.map((project) => project.id);
    const issues = await prisma.issue.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    const issueIds = issues.map((issue) => issue.id);
    const issueProjectMap = new Map(issues.map((issue) => [issue.id, issue.projectId]));
    const metricsByProject = new Map<
      string,
      { testCases: number; openBugs: number; passedCases: number; failedCases: number }
    >();

    for (const projectId of projectIds) {
      metricsByProject.set(projectId, {
        testCases: 0,
        openBugs: 0,
        passedCases: 0,
        failedCases: 0,
      });
    }

    if (issueIds.length > 0) {
      const [testCases, bugs] = await Promise.all([
        prisma.testCase.findMany({
          where: {
            issueId: {
              in: issueIds,
            },
            deletedAt: null,
          },
          select: {
            issueId: true,
            status: true,
          },
        }),
        prisma.bug.findMany({
          where: {
            issueId: {
              in: issueIds,
            },
            deletedAt: null,
          },
          select: {
            issueId: true,
            status: true,
          },
        }),
      ]);

      for (const testCase of testCases) {
        const projectId = issueProjectMap.get(testCase.issueId);
        if (!projectId) {
          continue;
        }

        const metrics = metricsByProject.get(projectId);
        if (!metrics) {
          continue;
        }

        metrics.testCases += 1;
        if (testCase.status === TestCaseStatus.PASSED) {
          metrics.passedCases += 1;
        }
        if (testCase.status === TestCaseStatus.FAILED) {
          metrics.failedCases += 1;
        }
      }

      for (const bug of bugs) {
        if (bug.status === BugStatus.CLOSED) {
          continue;
        }

        const projectId = issueProjectMap.get(bug.issueId);
        if (!projectId) {
          continue;
        }

        const metrics = metricsByProject.get(projectId);
        if (!metrics) {
          continue;
        }

        metrics.openBugs += 1;
      }
    }

    return projects.map((project) => ({
      ...buildProjectCardMetrics(metricsByProject.get(project.id)),
      id: project.id,
      repositoryId: project.repositoryId,
      slug: project.slug,
      name: project.name,
      // description は現時点でDBスキーマ未定義のためnull。
      // 将来マイグレーション追加後に project.description へ変更する。
      description: null,
      status: normalizeProjectStatus(project.status),
      dueDate: project.dueDate?.toISOString() ?? null,
      openIssues: project._count.issues,
    }));
  }
}

function buildProjectCardMetrics(
  metrics:
    | { testCases: number; openBugs: number; passedCases: number; failedCases: number }
    | undefined,
): Pick<ProjectSummary, "testCases" | "openBugs" | "passRate"> {
  if (!metrics) {
    return {
      testCases: 0,
      openBugs: 0,
      passRate: 0,
    };
  }

  const denominator = metrics.passedCases + metrics.failedCases;
  const passRate = denominator > 0 ? Math.round((metrics.passedCases / denominator) * 100) : 0;

  return {
    testCases: metrics.testCases,
    openBugs: metrics.openBugs,
    passRate,
  };
}

function normalizeProjectStatus(status: ProjectStatus): ProjectSummary["status"] {
  if (status === ProjectStatus.ACTIVE) {
    return "ACTIVE";
  }

  if (status === ProjectStatus.ARCHIVED) {
    return "ARCHIVED";
  }

  return "PLANNING";
}
