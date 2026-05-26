import { PrismaIssueRepository } from "@/features/issues/repositories/issue.prisma-repository";
import {
  InMemoryIssueRepository,
  type IssueRepository,
} from "@/features/issues/repositories/issue.repository";
import {
  type IssueListQueryDto,
  type ListIssuesResponseDto,
  listIssuesResponseSchema,
} from "@/features/issues/schemas/issue-summary.schema";

export class ListIssuesService {
  public constructor(private readonly repository: IssueRepository = createDefaultRepository()) {}

  public async execute(
    organizationSlug: string,
    projectId: string,
    filters: IssueListQueryDto,
  ): Promise<ListIssuesResponseDto> {
    let issues: Awaited<ReturnType<IssueRepository["listByProject"]>>;
    try {
      issues = await this.repository.listByProject(organizationSlug, projectId, filters);
    } catch (error) {
      if (!isMissingDatabaseUrlError(error)) {
        throw error;
      }

      issues = await new InMemoryIssueRepository().listByProject(
        organizationSlug,
        projectId,
        filters,
      );
    }

    return listIssuesResponseSchema.parse({
      data: issues,
    });
  }
}

function isMissingDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Environment variable not found: DATABASE_URL");
}

function createDefaultRepository(): IssueRepository {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL) {
    return new InMemoryIssueRepository();
  }

  return new PrismaIssueRepository();
}
