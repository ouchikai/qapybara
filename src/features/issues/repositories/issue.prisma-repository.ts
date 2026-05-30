import { type IssuePriority as PrismaIssuePriority, IssueStatus } from "@prisma/client";

import type {
  IssueListFilters,
  IssuePriority,
  IssueSummary,
} from "@/features/issues/types/issue-summary";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

import type { IssueRepository } from "./issue.repository";

export class PrismaIssueRepository implements IssueRepository {
  public async listByProject(
    organizationSlug: string,
    projectId: string,
    filters: IssueListFilters,
  ): Promise<IssueSummary[]> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
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

    if (!project) {
      throw new ApiError("NOT_FOUND", "Project was not found");
    }

    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        deletedAt: null,
        ...(filters.status ? { status: parseIssueStatus(filters.status) } : {}),
        ...(filters.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      },
      include: {
        assignee: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            testCases: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return issues.map((issue) => ({
      id: issue.id,
      projectId: issue.projectId,
      externalIssueNumber: issue.externalIssueNumber,
      title: issue.title,
      status: issue.status,
      priority: toPriorityDto(issue.priority),
      labels: issue.labels,
      assigneeId: issue.assignee?.id ?? null,
      assigneeName: issue.assignee?.displayName ?? null,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      testCaseCount: issue._count.testCases,
    }));
  }
}

function toPriorityDto(priority: PrismaIssuePriority | null): IssuePriority | null {
  if (!priority) {
    return null;
  }
  return priority.toLowerCase() as IssuePriority;
}

function parseIssueStatus(status: IssueSummary["status"]): IssueStatus {
  if (status === "OPEN") {
    return IssueStatus.OPEN;
  }

  if (status === "TRIAGED") {
    return IssueStatus.TRIAGED;
  }

  if (status === "IN_PROGRESS") {
    return IssueStatus.IN_PROGRESS;
  }

  if (status === "RESOLVED") {
    return IssueStatus.RESOLVED;
  }

  return IssueStatus.CLOSED;
}
