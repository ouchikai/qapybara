import {
  InMemoryIssueDetailRepository,
  type IssueDetailRepository,
} from "@/features/issues/repositories/issue-detail.repository";
import { PrismaIssueDetailRepository } from "@/features/issues/repositories/issue-detail.prisma-repository";
import {
  aiAnalysisSchema,
  issueDetailSchema,
  relatedBugSchema,
  type ReportBugInput,
} from "@/features/issues/schemas/issue-detail.schema";
import type { AiAnalysis, IssueDetail, RelatedBug } from "@/features/issues/types/issue-detail";

/**
 * Issue詳細アグリゲートのユースケース。
 * DATABASE_URL未設定時はInMemoryリポジトリへ自動フォールバックする
 * （既存サービス群と同じ方針）。
 */
export class IssueDetailService {
  public constructor(
    private readonly repository: IssueDetailRepository = createDefaultRepository(),
    private readonly fallback: IssueDetailRepository = new InMemoryIssueDetailRepository(),
  ) {}

  public async getDetail(
    organizationSlug: string,
    issueId: string,
  ): Promise<IssueDetail | null> {
    const detail = await this.run((repo) => repo.getDetail(organizationSlug, issueId));
    return detail ? issueDetailSchema.parse(detail) : null;
  }

  public async regenerateAnalysis(
    organizationSlug: string,
    issueId: string,
  ): Promise<AiAnalysis> {
    const analysis = await this.run((repo) =>
      repo.regenerateAnalysis(organizationSlug, issueId),
    );
    return aiAnalysisSchema.parse(analysis);
  }

  public async createBug(
    organizationSlug: string,
    input: ReportBugInput,
  ): Promise<RelatedBug> {
    const bug = await this.run((repo) => repo.createBug(organizationSlug, input));
    return relatedBugSchema.parse(bug);
  }

  private async run<T>(operation: (repo: IssueDetailRepository) => Promise<T>): Promise<T> {
    try {
      return await operation(this.repository);
    } catch (error) {
      if (!isMissingDatabaseUrlError(error)) {
        throw error;
      }
      return operation(this.fallback);
    }
  }
}

function isMissingDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.includes("Environment variable not found: DATABASE_URL");
}

function createDefaultRepository(): IssueDetailRepository {
  if (process.env.NODE_ENV === "test" || !process.env.DATABASE_URL) {
    return new InMemoryIssueDetailRepository();
  }
  return new PrismaIssueDetailRepository();
}
