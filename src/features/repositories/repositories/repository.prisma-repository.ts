import { IssueStatus } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

import type { RepositorySummary } from "../types/repository-summary";
import type { RepositoryRepository } from "./repository.repository";

const openIssueStatuses: IssueStatus[] = [
  IssueStatus.OPEN,
  IssueStatus.TRIAGED,
  IssueStatus.IN_PROGRESS,
];

export class PrismaRepositoryRepository implements RepositoryRepository {
  public async listSummaries(organizationSlug: string): Promise<RepositorySummary[]> {
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      throw new ApiError("NOT_FOUND", "Organization was not found");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
      },
      include: {
        projects: {
          where: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return repositories.map((repository) => ({
      id: repository.id,
      slug: repository.slug,
      name: repository.name,
      activeProjects: repository.projects.length,
      openIssues: repository.projects.reduce((total, project) => total + project._count.issues, 0),
    }));
  }
}
