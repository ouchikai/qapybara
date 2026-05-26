import { PrismaProjectRepository } from "@/features/projects/repositories/project.prisma-repository";
import {
  InMemoryProjectRepository,
  type ProjectRepository,
} from "@/features/projects/repositories/project.repository";
import {
  type ListProjectsResponseDto,
  listProjectsResponseSchema,
} from "@/features/projects/schemas/project-summary.schema";

export class ListProjectsService {
  public constructor(private readonly repository: ProjectRepository = createDefaultRepository()) {}

  public async execute(
    organizationSlug: string,
    repositoryId: string,
  ): Promise<ListProjectsResponseDto> {
    let projects: Awaited<ReturnType<ProjectRepository["listByRepository"]>>;
    try {
      projects = await this.repository.listByRepository(organizationSlug, repositoryId);
    } catch (error) {
      if (!isMissingDatabaseUrlError(error)) {
        throw error;
      }

      projects = await new InMemoryProjectRepository().listByRepository(
        organizationSlug,
        repositoryId,
      );
    }

    return listProjectsResponseSchema.parse({
      data: projects,
    });
  }
}

function isMissingDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Environment variable not found: DATABASE_URL");
}

function createDefaultRepository(): ProjectRepository {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL) {
    return new InMemoryProjectRepository();
  }

  return new PrismaProjectRepository();
}
