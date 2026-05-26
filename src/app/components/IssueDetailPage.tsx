import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, FileCode, Sparkles, AlertTriangle, Bug as BugIcon } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { BugReportModal } from './BugReportModal';

export function IssueDetailPage() {
  const { repoId, projectId, issueId } = useParams();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showBugReport, setShowBugReport] = useState(false);

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock

  // Mock related bugs
  const relatedBugs = [
    {
      id: 1,
      title: '権限チェックでタイムアウトが発生',
      severity: 'high',
      status: 'in-progress',
    },
    {
      id: 2,
      title: 'PDFエクスポートで日本語が文字化け',
      severity: 'medium',
      status: 'new',
    },
  ];

  const mockIssue = {
    id: Number(issueId),
    number: 124,
    title: '取引履歴エクスポート機能の追加',
    description: `
## 概要
ユーザーが取引履歴をCSV/PDFでエクスポートできる機能を追加する

## 要件
- 期間指定でのエクスポート
- CSV/PDF形式対応
- 権限チェック（自分の取引のみ）
- 大量データ対応（非同期処理）

## 影響範囲
- /api/transactions/export エンドポイント追加
- TransactionService の拡張
- UI: 取引履歴画面にエクスポートボタン追加
    `,
    changedFiles: [
      'src/api/routes/transactions.ts',
      'src/services/TransactionService.ts',
      'src/components/TransactionHistory.tsx',
      'src/utils/exporters/CsvExporter.ts',
      'src/utils/exporters/PdfExporter.ts',
    ],
  };

  const mockAnalysis = {
    impactAreas: [
      {
        area: 'Authentication & Authorization',
        risk: 'S',
        description: '権限チェックの実装が必要。他ユーザーのデータアクセス防止',
        affectedFeatures: ['取引履歴閲覧', 'データエクスポート'],
      },
      {
        area: 'Data Export',
        risk: 'A',
        description: '大量データ処理の性能影響。メモリリーク可能性',
        affectedFeatures: ['CSV生成', 'PDF生成', '非同期ジョブ処理'],
      },
      {
        area: 'UI/UX',
        risk: 'B',
        description: 'エクスポートボタンの配置、進捗表示',
        affectedFeatures: ['取引履歴画面'],
      },
    ],
    suggestedTestCases: [
      {
        id: 1,
        title: '権限チェック: 他ユーザーのデータエクスポート試行',
        risk: 'S',
        category: 'Security',
        steps: [
          'ユーザーAでログイン',
          'ユーザーBの取引IDを指定してエクスポート実行',
          '403 Forbiddenが返却されることを確認',
        ],
      },
      {
        id: 2,
        title: 'CSV: 大量データエクスポート（10万件）',
        risk: 'A',
        category: 'Performance',
        steps: [
          '10万件のデータを持つアカウントでログイン',
          '全期間指定でCSVエクスポート実行',
          'タイムアウトせず完了することを確認',
          'メモリ使用量が閾値以下であることを確認',
        ],
      },
      {
        id: 3,
        title: 'PDF: 日本語文字化け確認',
        risk: 'B',
        category: 'Functional',
        steps: [
          '日本語データを含む取引を準備',
          'PDFエクスポート実行',
          '日本語が正しく表示されることを確認',
        ],
      },
    ],
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleGenerateTestCases = () => {
    navigate(
      `/repositories/${repoId}/projects/${projectId}/issues/${issueId}/test-cases`,
      {
        state: {
          generatedCases: mockAnalysis.suggestedTestCases,
        }
      }
    );
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      S: 'text-destructive bg-destructive/10 border-destructive/20',
      A: 'text-chart-1 bg-chart-1/10 border-chart-1/20',
      B: 'text-chart-4 bg-chart-4/10 border-chart-4/20',
      C: 'text-muted-foreground bg-muted border-border',
    };
    return colors[risk as keyof typeof colors] || colors.C;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Repositories', path: '/repositories' },
            { label: repoName, path: `/repositories/${repoId}/projects` },
            { label: projectName, path: `/repositories/${repoId}/projects/${projectId}/issues` },
            { label: `Issue #${mockIssue.number}` },
          ]}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">#{mockIssue.number}</span>
              <h1>{mockIssue.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBugReport(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <BugIcon className="size-4" />
              Report Bug
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {isAnalyzing ? 'Analyzing...' : 'AI Impact Analysis'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Left Column: Issue Details */}
          <div className="space-y-6">
            <section className="bg-card border border-border rounded-lg p-4">
              <h2 className="mb-3">Description</h2>
              <div className="prose prose-sm max-w-none text-foreground">
                <pre className="whitespace-pre-wrap text-sm">{mockIssue.description}</pre>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="size-5" />
                <h2>Changed Files</h2>
              </div>
              <ul className="space-y-2">
                {mockIssue.changedFiles.map((file) => (
                  <li
                    key={file}
                    className="text-sm font-mono bg-muted px-3 py-2 rounded border border-border"
                  >
                    {file}
                  </li>
                ))}
              </ul>
            </section>

            {/* Related Bugs */}
            {relatedBugs.length > 0 && (
              <section className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BugIcon className="size-5" />
                    <h2>Related Bugs</h2>
                  </div>
                  <Link
                    to={`/repositories/${repoId}/projects/${projectId}/bugs`}
                    className="text-sm text-primary hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="space-y-2">
                  {relatedBugs.map((bug) => (
                    <Link
                      key={bug.id}
                      to={`/repositories/${repoId}/projects/${projectId}/bugs`}
                      className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-muted-foreground" />
                        <span className="text-sm">{bug.title}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        bug.severity === 'high'
                          ? 'bg-chart-1/10 text-chart-1'
                          : 'bg-chart-4/10 text-chart-4'
                      }`}>
                        {bug.severity}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: AI Analysis Results */}
          <div className="space-y-6">
            {!analysisResult && !isAnalyzing && (
              <div className="bg-muted/30 border border-dashed border-border rounded-lg p-8 text-center">
                <Sparkles className="size-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click "AI Impact Analysis" to analyze impact areas and generate test cases
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing code changes and impact...</p>
              </div>
            )}

            {analysisResult && (
              <>
                <section className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-5" />
                    <h2>Impact Areas</h2>
                  </div>
                  <div className="space-y-3">
                    {analysisResult.impactAreas.map((area: any, index: number) => (
                      <div
                        key={index}
                        className="border border-border rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm">{area.area}</h3>
                          <span className={`px-2 py-1 rounded text-xs border font-semibold ${getRiskColor(area.risk)}`}>
                            Risk: {area.risk}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{area.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {area.affectedFeatures.map((feature: string) => (
                            <span
                              key={feature}
                              className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2>AI Generated Test Cases</h2>
                    <span className="text-sm text-muted-foreground">
                      {analysisResult.suggestedTestCases.length} cases
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {analysisResult.suggestedTestCases.map((testCase: any) => (
                      <div
                        key={testCase.id}
                        className="border border-border rounded-md p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs border font-semibold ${getRiskColor(testCase.risk)}`}>
                                {testCase.risk}
                              </span>
                              <span className="text-xs px-2 py-1 bg-muted rounded">
                                {testCase.category}
                              </span>
                            </div>
                            <h4 className="text-sm">{testCase.title}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerateTestCases}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Open in Test Case Editor
                  </button>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bug Report Modal */}
      {showBugReport && (
        <BugReportModal
          onClose={() => setShowBugReport(false)}
          onSubmit={() => setShowBugReport(false)}
          issueId={mockIssue.id}
          issueNumber={mockIssue.number}
          issueTitle={mockIssue.title}
        />
      )}
    </div>
  );
}
