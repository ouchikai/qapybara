import { PrismaRepositoryRepository as PrismaRepositoryRepositoryImpl } from "@/features/repositories/repositories/repository.prisma-repository";
import {
  InMemoryRepositoryRepository,
  type RepositoryRepository,
} from "@/features/repositories/repositories/repository.repository";
import {
  type ListRepositoriesResponseDto,
  listRepositoriesResponseSchema,
} from "@/features/repositories/schemas/repository-summary.schema";

export class ListRepositoriesService {
  public constructor(
    private readonly repository: RepositoryRepository = createDefaultRepository(),
  ) {}

  public async execute(organizationSlug: string): Promise<ListRepositoriesResponseDto> {
    let summaries: Awaited<ReturnType<RepositoryRepository["listSummaries"]>>;
    try {
      summaries = await this.repository.listSummaries(organizationSlug);
    } catch (error) {
      if (!isMissingDatabaseUrlError(error)) {
        throw error;
      }

      summaries = await new InMemoryRepositoryRepository().listSummaries(organizationSlug);
    }

    return listRepositoriesResponseSchema.parse({
      data: summaries,
    });
  }
}

function isMissingDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Environment variable not found: DATABASE_URL");
}

function createDefaultRepository(): RepositoryRepository {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL) {
    return new InMemoryRepositoryRepository();
  }

  return new PrismaRepositoryRepositoryImpl();
}
