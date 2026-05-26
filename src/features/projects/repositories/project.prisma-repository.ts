import { IssueStatus, ProjectStatus } from "@prisma/client";

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

    return projects.map((project) => ({
      id: project.id,
      repositoryId: project.repositoryId,
      slug: project.slug,
      name: project.name,
      status: normalizeProjectStatus(project.status),
      dueDate: project.dueDate?.toISOString() ?? null,
      openIssues: project._count.issues,
    }));
  }
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
