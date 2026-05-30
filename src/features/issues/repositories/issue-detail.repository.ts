import {
  buildAnalysisFallback,
  testCaseSuggestionTemplates,
} from "@/features/issues/lib/issue-analysis-template";
import type {
  AiAnalysis,
  IssueDetail,
  RelatedBug,
} from "@/features/issues/types/issue-detail";
import type { ReportBugInput } from "@/features/issues/schemas/issue-detail.schema";

export interface IssueDetailRepository {
  /** Issue詳細を取得する。存在しない場合は null。 */
  getDetail(organizationSlug: string, issueId: string): Promise<IssueDetail | null>;
  /** AI影響分析を（再）生成して永続化し、結果を返す。 */
  regenerateAnalysis(organizationSlug: string, issueId: string): Promise<AiAnalysis>;
  /** バグを作成し、作成したバグのサマリを返す。 */
  createBug(organizationSlug: string, input: ReportBugInput): Promise<RelatedBug>;
}

/**
 * DBが無い環境（DATABASE_URL未設定 / テスト）向けのフォールバック実装。
 * シードデータ（issue_124）と同等の内容を返す。
 */
export class InMemoryIssueDetailRepository implements IssueDetailRepository {
  private readonly analyses = new Map<string, AiAnalysis>();
  private readonly extraBugs = new Map<string, RelatedBug[]>();

  public async getDetail(_: string, issueId: string): Promise<IssueDetail | null> {
    const base = buildBaseDetail(issueId);
    if (!base) {
      return null;
    }

    return {
      ...base,
      relatedBugs: [...base.relatedBugs, ...(this.extraBugs.get(issueId) ?? [])],
      aiAnalysis: this.analyses.get(issueId) ?? base.aiAnalysis,
    };
  }

  public async regenerateAnalysis(_: string, issueId: string): Promise<AiAnalysis> {
    const analysis = buildAnalysisFallback(issueId);
    this.analyses.set(issueId, analysis);
    return analysis;
  }

  public async createBug(_: string, input: ReportBugInput): Promise<RelatedBug> {
    const bug: RelatedBug = {
      id: `bug_${Date.now()}`,
      title: input.title,
      severity: input.severity,
      status: "new",
    };
    const current = this.extraBugs.get(input.issueId) ?? [];
    this.extraBugs.set(input.issueId, [...current, bug]);
    return bug;
  }
}

/**
 * issue_124（仕様書のサンプルIssue）を中心としたフォールバック詳細データ。
 * その他のIDに対しても最低限の詳細を返す。
 */
function buildBaseDetail(issueId: string): IssueDetail | null {
  if (issueId === "issue_124") {
    return {
      id: "issue_124",
      projectId: "project_v2_5_release",
      repositoryId: "repo_finance_portal",
      repositoryName: "finance-portal",
      projectName: "v2.5 Release",
      externalIssueNumber: 124,
      title: "取引履歴エクスポート機能の追加",
      description: [
        "## 概要",
        "ユーザーが取引履歴をCSV/PDFでエクスポートできる機能を追加する",
        "",
        "## 要件",
        "- 期間指定でのエクスポート",
        "- CSV/PDF形式対応",
        "- 権限チェック（自分の取引のみ）",
        "- 大量データ対応（非同期処理）",
        "",
        "## 影響範囲",
        "- /api/transactions/export エンドポイント追加",
        "- TransactionService の拡張",
        "- UI: 取引履歴画面にエクスポートボタン追加",
      ].join("\n"),
      status: "IN_PROGRESS",
      priority: "medium",
      labels: ["enhancement", "feature"],
      changedFiles: [
        "src/api/routes/transactions.ts",
        "src/services/TransactionService.ts",
        "src/components/TransactionHistory.tsx",
        "src/utils/exporters/CsvExporter.ts",
        "src/utils/exporters/PdfExporter.ts",
      ],
      assigneeId: "user_sato",
      assigneeName: "佐藤花子",
      createdAt: new Date("2026-05-19T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-05-24T10:00:00.000Z").toISOString(),
      relatedBugs: [
        {
          id: "bug_124_1",
          title: "権限チェックでタイムアウトが発生",
          severity: "high",
          status: "in-progress",
        },
        {
          id: "bug_124_2",
          title: "PDFエクスポートで日本語が文字化け",
          severity: "medium",
          status: "new",
        },
      ],
      aiAnalysis: null,
    };
  }

  // 汎用フォールバック（issue_123 / issue_125 等）。
  const numberMatch = issueId.match(/(\d+)/);
  return {
    id: issueId,
    projectId: "project_v2_5_release",
    repositoryId: "repo_finance_portal",
    repositoryName: "finance-portal",
    projectName: "v2.5 Release",
    externalIssueNumber: numberMatch ? Number(numberMatch[1]) : null,
    title: "サンプルIssue",
    description: "## 概要\nフォールバックデータです（DB未接続）。",
    status: "OPEN",
    priority: null,
    labels: [],
    changedFiles: [],
    assigneeId: null,
    assigneeName: null,
    createdAt: new Date("2026-05-20T09:00:00.000Z").toISOString(),
    updatedAt: new Date("2026-05-20T09:00:00.000Z").toISOString(),
    relatedBugs: [],
    aiAnalysis: null,
  };
}

/** テンプレートのテストケース候補数（UIのバッジ等で利用可能）。 */
export const fallbackSuggestionCount = testCaseSuggestionTemplates.length;
