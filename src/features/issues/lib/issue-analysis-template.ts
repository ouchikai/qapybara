import type { AiAnalysis, RiskLevel } from "@/features/issues/types/issue-detail";

export interface ImpactAreaTemplate {
  area: string;
  risk: RiskLevel;
  description: string;
  affectedFeatures: string[];
}

export interface TestCaseSuggestionTemplate {
  title: string;
  risk: RiskLevel;
  category: string;
  steps: string[];
}

/**
 * モックAI影響分析テンプレート。
 *
 * 本来はコード差分(changedFiles)を入力に実際のAI APIを呼び出すが、ここでは
 * 決定論的な固定結果を返す。Server Action / Seed の双方から参照され、
 * 「生成される分析結果」を一貫させる。
 */
export const impactAreaTemplates: ImpactAreaTemplate[] = [
  {
    area: "Authentication & Authorization",
    risk: "S",
    description: "権限チェックの実装が必要。他ユーザーのデータアクセス防止",
    affectedFeatures: ["取引履歴閲覧", "データエクスポート"],
  },
  {
    area: "Data Export",
    risk: "A",
    description: "大量データ処理の性能影響。メモリリーク可能性",
    affectedFeatures: ["CSV生成", "PDF生成", "非同期ジョブ処理"],
  },
  {
    area: "UI/UX",
    risk: "B",
    description: "エクスポートボタンの配置、進捗表示",
    affectedFeatures: ["取引履歴画面"],
  },
];

export const testCaseSuggestionTemplates: TestCaseSuggestionTemplate[] = [
  {
    title: "権限チェック: 他ユーザーのデータエクスポート試行",
    risk: "S",
    category: "Security",
    steps: [
      "ユーザーAでログイン",
      "ユーザーBの取引IDを指定してエクスポート実行",
      "403 Forbiddenが返却されることを確認",
    ],
  },
  {
    title: "CSV: 大量データエクスポート（10万件）",
    risk: "A",
    category: "Performance",
    steps: [
      "10万件のデータを持つアカウントでログイン",
      "全期間指定でCSVエクスポート実行",
      "タイムアウトせず完了することを確認",
      "メモリ使用量が閾値以下であることを確認",
    ],
  },
  {
    title: "PDF: 日本語文字化け確認",
    risk: "B",
    category: "Functional",
    steps: [
      "日本語データを含む取引を準備",
      "PDFエクスポート実行",
      "日本語が正しく表示されることを確認",
    ],
  },
];

/**
 * DBが利用できない場合に使う、合成IDを付与した分析結果DTOを生成する。
 */
export function buildAnalysisFallback(issueId: string): AiAnalysis {
  return {
    id: `analysis_${issueId}`,
    createdAt: new Date().toISOString(),
    impactAreas: impactAreaTemplates.map((area, index) => ({
      id: `impact_${issueId}_${index}`,
      ...area,
    })),
    testCaseSuggestions: testCaseSuggestionTemplates.map((suggestion, index) => ({
      id: `suggestion_${issueId}_${index}`,
      ...suggestion,
    })),
  };
}
