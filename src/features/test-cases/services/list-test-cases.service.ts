import { PrismaTestCaseRepository } from "@/features/test-cases/repositories/test-case.prisma-repository";
import {
  InMemoryTestCaseRepository,
  type TestCaseRepository,
} from "@/features/test-cases/repositories/test-case.repository";
import {
  type ListTestCasesResponseDto,
  listTestCasesResponseSchema,
} from "@/features/test-cases/schemas/test-case-summary.schema";

export class ListTestCasesService {
  public constructor(private readonly repository: TestCaseRepository = createDefaultRepository()) {}

  public async execute(
    organizationSlug: string,
    issueId: string,
  ): Promise<ListTestCasesResponseDto> {
    let result: Awaited<ReturnType<TestCaseRepository["listByIssue"]>>;
    try {
      result = await this.repository.listByIssue(organizationSlug, issueId);
    } catch (error) {
      if (!isMissingDatabaseUrlError(error)) {
        throw error;
      }

      result = await new InMemoryTestCaseRepository().listByIssue(organizationSlug, issueId);
    }

    return listTestCasesResponseSchema.parse({
      data: result,
    });
  }
}

function isMissingDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Environment variable not found: DATABASE_URL");
}

function createDefaultRepository(): TestCaseRepository {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL) {
    return new InMemoryTestCaseRepository();
  }

  return new PrismaTestCaseRepository();
}
