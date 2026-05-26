import type {
  TestCaseCustomFieldDefinition,
  TestCaseSummary,
} from "@/features/test-cases/types/test-case-summary";

export interface TestCaseRepository {
  listByIssue(
    organizationSlug: string,
    issueId: string,
  ): Promise<{
    customFieldDefinitions: TestCaseCustomFieldDefinition[];
    testCases: TestCaseSummary[];
  }>;
}

export class InMemoryTestCaseRepository implements TestCaseRepository {
  public async listByIssue(
    _: string,
    issueId: string,
  ): Promise<{
    customFieldDefinitions: TestCaseCustomFieldDefinition[];
    testCases: TestCaseSummary[];
  }> {
    const customFieldDefinitions: TestCaseCustomFieldDefinition[] = [
      {
        id: "cf_1",
        name: "分類",
        description: "オンライン、バッチなどの項目を記載する",
        fieldType: "DROPDOWN",
        options: ["オンライン", "バッチ", "API"],
      },
      {
        id: "cf_2",
        name: "画面系/機能系",
        description: "画面に注目したケースか機能に注目したケースか区分を記載",
        fieldType: "DROPDOWN",
        options: ["画面系", "機能系"],
      },
      {
        id: "cf_3",
        name: "テスト観点",
        description: "テストの観点を記載",
        fieldType: "DROPDOWN",
        options: ["オートサジェスト", "テキスト", "書式", "マスキング", "運用", "ログ"],
      },
      {
        id: "cf_4",
        name: "手順",
        description: "ケースの手順を記載する",
        fieldType: "TEXTAREA",
        options: [],
      },
    ];

    const testCases: TestCaseSummary[] = [
      {
        id: "tc_1",
        issueId,
        title: "権限チェック: 他ユーザーのデータエクスポート試行",
        status: "PASSED",
        assigneeId: "1",
        assigneeName: "田中太郎",
        executionCount: 3,
        lastExecutionAt: "2026-05-22T10:30:00.000Z",
        customFieldValues: {
          分類: "API",
          "画面系/機能系": "機能系",
          テスト観点: "マスキング",
        },
      },
      {
        id: "tc_2",
        issueId,
        title: "CSV: 大量データエクスポート（10万件）",
        status: "FAILED",
        assigneeId: "2",
        assigneeName: "佐藤花子",
        executionCount: 2,
        lastExecutionAt: "2026-05-22T09:15:00.000Z",
        customFieldValues: {
          分類: "バッチ",
          "画面系/機能系": "機能系",
          テスト観点: "運用",
        },
      },
      {
        id: "tc_3",
        issueId,
        title: "PDF: 日本語文字化け確認",
        status: "FAILED",
        assigneeId: "3",
        assigneeName: "鈴木一郎",
        executionCount: 1,
        lastExecutionAt: "2026-05-21T16:20:00.000Z",
        customFieldValues: {
          分類: "オンライン",
          "画面系/機能系": "画面系",
          テスト観点: "書式",
        },
      },
      {
        id: "tc_4",
        issueId,
        title: "セッションタイムアウト後の動作確認",
        status: "READY",
        assigneeId: "4",
        assigneeName: "山田次郎",
        executionCount: 0,
        lastExecutionAt: null,
        customFieldValues: {
          分類: "オンライン",
          "画面系/機能系": "機能系",
          テスト観点: "ログ",
        },
      },
    ];

    return { customFieldDefinitions, testCases };
  }
}
