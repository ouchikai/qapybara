import { CustomFieldType, TestCaseStatus } from "@prisma/client";

import type {
  TestCaseCustomFieldDefinition,
  TestCaseSummary,
} from "@/features/test-cases/types/test-case-summary";
import { prisma } from "@/server/db/prisma";
import { ApiError } from "@/server/http/api-error";

import type { TestCaseRepository } from "./test-case.repository";

export class PrismaTestCaseRepository implements TestCaseRepository {
  public async listByIssue(
    organizationSlug: string,
    issueId: string,
  ): Promise<{
    customFieldDefinitions: TestCaseCustomFieldDefinition[];
    testCases: TestCaseSummary[];
  }> {
    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        deletedAt: null,
        organization: {
          slug: organizationSlug,
          deletedAt: null,
        },
      },
      include: {
        project: {
          select: {
            repositoryId: true,
          },
        },
      },
    });

    if (!issue) {
      throw new ApiError("NOT_FOUND", "Issue was not found");
    }

    const [testCases, customFieldDefinitions] = await Promise.all([
      prisma.testCase.findMany({
        where: {
          issueId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.testCaseCustomFieldDefinition.findMany({
        where: {
          repositoryId: issue.project.repositoryId,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    const assigneeIds = Array.from(
      new Set(testCases.map((testCase) => testCase.assigneeId).filter((id): id is string => !!id)),
    );

    const assignees =
      assigneeIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: assigneeIds,
              },
            },
            select: {
              id: true,
              displayName: true,
            },
          })
        : [];

    const assigneeNameById = new Map(
      assignees.map((assignee) => [assignee.id, assignee.displayName]),
    );

    return {
      customFieldDefinitions: customFieldDefinitions.map((definition) => ({
        id: definition.id,
        name: definition.name,
        description: definition.description,
        fieldType: normalizeCustomFieldType(definition.fieldType),
        options: parseOptions(definition.options),
      })),
      testCases: testCases.map((testCase) => ({
        id: testCase.id,
        issueId: testCase.issueId,
        title: testCase.title,
        status: normalizeTestCaseStatus(testCase.status),
        assigneeId: testCase.assigneeId,
        assigneeName: testCase.assigneeId
          ? (assigneeNameById.get(testCase.assigneeId) ?? null)
          : null,
        executionCount: testCase.executionCount,
        lastExecutionAt: testCase.lastExecutionAt?.toISOString() ?? null,
        customFieldValues: parseCustomFieldValues(testCase.customFieldValues),
      })),
    };
  }
}

function normalizeTestCaseStatus(status: TestCaseStatus): TestCaseSummary["status"] {
  if (status === TestCaseStatus.READY) {
    return "READY";
  }

  if (status === TestCaseStatus.PASSED) {
    return "PASSED";
  }

  if (status === TestCaseStatus.FAILED) {
    return "FAILED";
  }

  if (status === TestCaseStatus.ARCHIVED) {
    return "ARCHIVED";
  }

  return "DRAFT";
}

function normalizeCustomFieldType(
  fieldType: CustomFieldType,
): TestCaseCustomFieldDefinition["fieldType"] {
  if (fieldType === CustomFieldType.TEXT) {
    return "TEXT";
  }

  if (fieldType === CustomFieldType.TEXTAREA) {
    return "TEXTAREA";
  }

  return "DROPDOWN";
}

function parseOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter((value): value is string => typeof value === "string");
}

function parseCustomFieldValues(values: unknown): Record<string, string> {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return {};
  }

  const entries = Object.entries(values).filter((entry): entry is [string, string] => {
    return typeof entry[0] === "string" && typeof entry[1] === "string";
  });

  return Object.fromEntries(entries);
}
