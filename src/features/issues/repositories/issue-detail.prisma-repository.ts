import {
  type BugSeverity,
  type BugStatus,
  type IssuePriority as PrismaIssuePriority,
  RiskLevel as RiskLevelEnum,
} from "@prisma/client";

import {
  impactAreaTemplates,
  testCaseSuggestionTemplates,
} from "@/features/issues/lib/issue-analysis-template";
import type { ReportBugInput } from "@/features/issues/schemas/issue-detail.schema";
import type {
  AiAnalysis,
  BugSeverity as BugSeverityDto,
  BugStatus as BugStatusDto,
  IssueDetail,
  IssuePriority as IssuePriorityDto,
  RelatedBug,
  RiskLevel as RiskLevelDto,
} from "@/features/issues/types/issue-detail";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

import type { IssueDetailRepository } from "./issue-detail.repository";

export class PrismaIssueDetailRepository implements IssueDetailRepository {
  public async getDetail(
    organizationSlug: string,
    issueId: string,
  ): Promise<IssueDetail | null> {
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        deletedAt: null,
        organization: { slug: organizationSlug, deletedAt: null },
      },
      include: {
        project: { include: { repository: true } },
        assignee: { select: { id: true, displayName: true } },
        bugs: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          select: { id: true, title: true, severity: true, status: true },
        },
        aiAnalysis: {
          include: {
            impactAreas: { orderBy: { id: "asc" } },
            testCaseSuggestions: { orderBy: { id: "asc" } },
          },
        },
      },
    });

    if (!issue) {
      return null;
    }

    return {
      id: issue.id,
      projectId: issue.projectId,
      repositoryId: issue.project.repositoryId,
      repositoryName: issue.project.repository.name,
      projectName: issue.project.name,
      externalIssueNumber: issue.externalIssueNumber,
      title: issue.title,
      description: issue.description ?? "",
      status: issue.status,
      priority: toPriorityDto(issue.priority),
      labels: issue.labels,
      changedFiles: issue.changedFiles,
      assigneeId: issue.assignee?.id ?? null,
      assigneeName: issue.assignee?.displayName ?? null,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      relatedBugs: issue.bugs.map((bug) => ({
        id: bug.id,
        title: bug.title,
        severity: toSeverityDto(bug.severity),
        status: toBugStatusDto(bug.status),
      })),
      aiAnalysis: issue.aiAnalysis
        ? {
            id: issue.aiAnalysis.id,
            createdAt: issue.aiAnalysis.createdAt.toISOString(),
            impactAreas: issue.aiAnalysis.impactAreas.map((area) => ({
              id: area.id,
              area: area.area,
              risk: area.risk as RiskLevelDto,
              description: area.description,
              affectedFeatures: area.affectedFeatures,
            })),
            testCaseSuggestions: issue.aiAnalysis.testCaseSuggestions.map((suggestion) => ({
              id: suggestion.id,
              title: suggestion.title,
              risk: suggestion.risk as RiskLevelDto,
              category: suggestion.category,
              steps: suggestion.steps,
            })),
          }
        : null,
    };
  }

  public async regenerateAnalysis(
    organizationSlug: string,
    issueId: string,
  ): Promise<AiAnalysis> {
    const issue = await this.requireIssue(organizationSlug, issueId);

    const analysis = await prisma.$transaction(async (tx) => {
      await tx.issueAiAnalysis.deleteMany({ where: { issueId: issue.id } });

      return tx.issueAiAnalysis.create({
        data: {
          issueId: issue.id,
          impactAreas: {
            create: impactAreaTemplates.map((area) => ({
              area: area.area,
              risk: toRiskDb(area.risk),
              description: area.description,
              affectedFeatures: area.affectedFeatures,
            })),
          },
          testCaseSuggestions: {
            create: testCaseSuggestionTemplates.map((suggestion) => ({
              title: suggestion.title,
              risk: toRiskDb(suggestion.risk),
              category: suggestion.category,
              steps: suggestion.steps,
            })),
          },
        },
        include: {
          impactAreas: { orderBy: { id: "asc" } },
          testCaseSuggestions: { orderBy: { id: "asc" } },
        },
      });
    });

    return {
      id: analysis.id,
      createdAt: analysis.createdAt.toISOString(),
      impactAreas: analysis.impactAreas.map((area) => ({
        id: area.id,
        area: area.area,
        risk: area.risk as RiskLevelDto,
        description: area.description,
        affectedFeatures: area.affectedFeatures,
      })),
      testCaseSuggestions: analysis.testCaseSuggestions.map((suggestion) => ({
        id: suggestion.id,
        title: suggestion.title,
        risk: suggestion.risk as RiskLevelDto,
        category: suggestion.category,
        steps: suggestion.steps,
      })),
    };
  }

  public async createBug(
    organizationSlug: string,
    input: ReportBugInput,
  ): Promise<RelatedBug> {
    const issue = await this.requireIssue(organizationSlug, input.issueId);

    const bug = await prisma.bug.create({
      data: {
        organizationId: issue.organizationId,
        issueId: issue.id,
        title: input.title,
        description: input.description,
        severity: toSeverityDb(input.severity),
        status: "NEW",
      },
      select: { id: true, title: true, severity: true, status: true },
    });

    return {
      id: bug.id,
      title: bug.title,
      severity: toSeverityDto(bug.severity),
      status: toBugStatusDto(bug.status),
    };
  }

  private async requireIssue(organizationSlug: string, issueId: string) {
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        deletedAt: null,
        organization: { slug: organizationSlug, deletedAt: null },
      },
      select: { id: true, organizationId: true },
    });

    if (!issue) {
      throw new ApiError("NOT_FOUND", "Issue was not found");
    }

    return issue;
  }
}

function toPriorityDto(priority: PrismaIssuePriority | null): IssuePriorityDto | null {
  if (!priority) {
    return null;
  }
  return priority.toLowerCase() as IssuePriorityDto;
}

function toSeverityDto(severity: BugSeverity): BugSeverityDto {
  return severity.toLowerCase() as BugSeverityDto;
}

function toSeverityDb(severity: BugSeverityDto): BugSeverity {
  return severity.toUpperCase() as BugSeverity;
}

function toBugStatusDto(status: BugStatus): BugStatusDto {
  return status.toLowerCase().replace(/_/g, "-") as BugStatusDto;
}

function toRiskDb(risk: RiskLevelDto): RiskLevelEnum {
  return RiskLevelEnum[risk];
}
