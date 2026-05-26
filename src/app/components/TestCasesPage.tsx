import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, Link } from 'react-router';
import { Plus, Download, Upload, Save, AlertTriangle, Sparkles, Send, FileText } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { BugReportModal } from './BugReportModal';
import { BugDetailModal } from './BugDetailModal';
import { Bug } from './BugsPage';

interface CustomField {
  id: string;
  name: string;
  description: string;
  type: 'dropdown' | 'text' | 'textarea';
  options?: string[];
}

interface TestCase {
  id: number;
  title: string;
  status: string;
  assignee: string;
  executionCount: number;
  lastExecution?: string;
  steps?: string[];
  expected?: string;
  bugId?: number;
  customFields?: Record<string, string>;
}

export function TestCasesPage() {
  const location = useLocation();
  const { repoId, projectId, issueId } = useParams();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [showBugReport, setShowBugReport] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [reportedBugs, setReportedBugs] = useState<Bug[]>([]);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState('');

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock
  const issueNumber = 124; // Mock

  // Mock custom fields from repository settings
  const customFieldDefinitions: CustomField[] = [
    {
      id: '1',
      name: '分類',
      description: 'オンライン、バッチなどの項目を記載する',
      type: 'dropdown',
      options: ['オンライン', 'バッチ', 'API'],
    },
    {
      id: '2',
      name: '画面系/機能系',
      description: '画面に注目したケースか機能に注目したケースか区分を記載',
      type: 'dropdown',
      options: ['画面系', '機能系'],
    },
    {
      id: '3',
      name: 'テスト観点',
      description: 'テストの観点を記載',
      type: 'dropdown',
      options: ['オートサジェスト', 'テキスト', '書式', 'マスキング', '運用', 'ログ'],
    },
    {
      id: '4',
      name: '手順',
      description: 'ケースの手順を記載する',
      type: 'textarea',
    },
  ];

  // Mock issue data
  const issue = {
    id: Number(issueId),
    number: issueNumber,
    title: '取引履歴エクスポート機能の追加',
    description: 'ユーザーが自分の取引履歴をCSVまたはPDFでエクスポートできる機能を追加します。CSVとPDF両方のフォーマットに対応し、期間指定でのフィルタリング可能、最大10万件までのデータに対応します。',
  };

  // Column widths state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('testcase_column_widths');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default widths
    const defaults: Record<string, number> = {
      id: 60,
      title: 400,
      status: 120,
      assignee: 120,
      actions: 200,
    };

    // Add default widths for custom fields
    customFieldDefinitions.forEach((field) => {
      defaults[`custom_${field.id}`] = field.type === 'textarea' ? 200 : 150;
    });

    return defaults;
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    // Default mock data - always show this for demo
    const mockData = [
      {
        id: 1,
        title: '権限チェック: 他ユーザーのデータエクスポート試行',
        status: 'Passed',
        assignee: '田中太郎',
        executionCount: 3,
        lastExecution: '2026-05-22 10:30',
        customFields: {
          '1': 'API',
          '2': '機能系',
          '3': 'マスキング',
          '4': '1. ユーザーAでログイン\n2. ユーザーBの取引IDを指定してエクスポート実行\n3. 403 Forbiddenが返却されることを確認',
        },
      },
      {
        id: 2,
        title: 'CSV: 大量データエクスポート（10万件）',
        status: 'Failed',
        assignee: '佐藤花子',
        executionCount: 2,
        lastExecution: '2026-05-22 09:15',
        customFields: {
          '1': 'バッチ',
          '2': '機能系',
          '3': '運用',
          '4': '1. 10万件のデータを準備\n2. CSV形式でエクスポート実行\n3. ファイルサイズとパフォーマンスを確認',
        },
      },
      {
        id: 3,
        title: 'PDF: 日本語文字化け確認',
        status: 'Failed',
        assignee: '鈴木一郎',
        executionCount: 1,
        lastExecution: '2026-05-21 16:20',
        customFields: {
          '1': 'オンライン',
          '2': '画面系',
          '3': '書式',
          '4': '1. 日本語を含むデータをPDFでエクスポート\n2. PDFを開いて文字化けがないか確認',
        },
      },
      {
        id: 4,
        title: 'セッションタイムアウト後の動作確認',
        status: 'In Progress',
        assignee: '山田次郎',
        executionCount: 0,
        customFields: {
          '1': 'オンライン',
          '2': '機能系',
          '3': 'ログ',
          '4': '1. セッションタイムアウトを設定\n2. タイムアウト後にエクスポート試行\n3. 適切なエラーメッセージが表示されることを確認',
        },
      },
    ];

    if (location.state?.generatedCases && location.state.generatedCases.length > 0) {
      // If AI generated cases, add them to the mock data
      const generated = location.state.generatedCases.map((tc: any, index: number) => ({
        id: mockData.length + index + 1,
        title: tc.title,
        status: 'Not Started',
        assignee: '',
        executionCount: 0,
        steps: tc.steps,
        expected: tc.expected || 'エラーが発生しないこと',
      }));
      setTestCases([...mockData, ...generated]);
    } else {
      setTestCases(mockData);
    }
  }, [location.state]);

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    const updated = [...testCases];
    updated[rowIndex] = { ...updated[rowIndex], [field]: value };
    setTestCases(updated);
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newCase: TestCase = {
      id: testCases.length + 1,
      title: '',
      status: 'Not Started',
      assignee: '',
      executionCount: 0,
      customFields: {},
    };
    setTestCases([...testCases, newCase]);
  };

  // Column resize handlers
  const handleResizeStart = (columnId: string, startX: number) => {
    setResizingColumn(columnId);
    setResizeStartX(startX);
    setResizeStartWidth(columnWidths[columnId] || 120);
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;

    const diff = e.clientX - resizeStartX;
    const newWidth = Math.max(60, resizeStartWidth + diff);

    setColumnWidths((prev) => {
      const updated = { ...prev, [resizingColumn]: newWidth };
      localStorage.setItem('testcase_column_widths', JSON.stringify(updated));
      return updated;
    });
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  const getStatusColor = (status: string) => {
    const colors = {
      'Not Started': 'bg-muted text-muted-foreground',
      'In Progress': 'bg-chart-4/10 text-chart-4',
      'Passed': 'bg-chart-2/10 text-chart-2',
      'Failed': 'bg-destructive/10 text-destructive',
    };
    return colors[status as keyof typeof colors] || colors['Not Started'];
  };

  const handleAiSubmit = () => {
    if (!aiInput.trim()) return;

    setIsAiThinking(true);

    // Mock AI response
    setTimeout(() => {
      const response = generateAITestCases(aiInput);
      setLastAiResponse(response.message);

      // Add generated test cases to table
      if (response.cases.length > 0) {
        const newCases = response.cases.map((caseData, index) => ({
          id: testCases.length + index + 1,
          title: caseData.title,
          status: 'Not Started' as const,
          assignee: '',
          executionCount: 0,
          customFields: caseData.customFields,
        }));
        setTestCases([...testCases, ...newCases]);
      }

      setIsAiThinking(false);
      setAiInput('');
    }, 1500);
  };

  const generateAITestCases = (input: string): { message: string; cases: Array<{title: string; customFields: Record<string, string>}> } => {
    const inputLower = input.toLowerCase();

    if (inputLower.includes('セキュリティ') || inputLower.includes('security')) {
      return {
        message: '3件のセキュリティテストケースを追加しました',
        cases: [
          {
            title: '権限チェック: 他ユーザーのデータエクスポート試行',
            customFields: {
              '1': 'API',
              '2': '機能系',
              '3': 'マスキング',
              '4': '1. ユーザーAでログイン\n2. ユーザーBの取引IDを指定してエクスポート実行\n3. 403 Forbiddenが返却されることを確認',
            },
          },
          {
            title: '認証なしでのエクスポートAPIアクセス拒否確認',
            customFields: {
              '1': 'API',
              '2': '機能系',
              '3': 'マスキング',
              '4': '1. 認証トークンなしでエクスポートAPIを呼び出し\n2. 401 Unauthorizedが返却されることを確認',
            },
          },
          {
            title: 'SQLインジェクション対策: 期間指定パラメータの検証',
            customFields: {
              '1': 'API',
              '2': '機能系',
              '3': 'マスキング',
              '4': '1. 期間パラメータにSQLインジェクション文字列を含める\n2. エラーハンドリングされることを確認\n3. データが漏洩しないことを確認',
            },
          },
        ],
      };
    }

    if (inputLower.includes('境界値') || inputLower.includes('boundary') || inputLower.includes('エッジ')) {
      return {
        message: '3件の境界値テストケースを追加しました',
        cases: [
          {
            title: 'データ0件のエクスポート',
            customFields: {
              '1': 'オンライン',
              '2': '機能系',
              '3': 'テキスト',
              '4': '1. データが0件の状態でエクスポート実行\n2. 空のファイルが生成されることを確認',
            },
          },
          {
            title: '上限10万件ちょうどのエクスポート',
            customFields: {
              '1': 'バッチ',
              '2': '機能系',
              '3': '運用',
              '4': '1. 10万件のデータを準備\n2. エクスポート実行\n3. 正常に完了することを確認',
            },
          },
          {
            title: '10万件を超えるデータのエクスポート試行（エラー確認）',
            customFields: {
              '1': 'バッチ',
              '2': '機能系',
              '3': '運用',
              '4': '1. 10万1件のデータを準備\n2. エクスポート実行\n3. エラーメッセージが表示されることを確認',
            },
          },
        ],
      };
    }

    if (inputLower.includes('パフォーマンス') || inputLower.includes('performance') || inputLower.includes('負荷')) {
      return {
        message: '2件のパフォーマンステストケースを追加しました',
        cases: [
          {
            title: 'CSV: 大量データ（10万件）エクスポート時間測定',
            customFields: {
              '1': 'バッチ',
              '2': '機能系',
              '3': '運用',
              '4': '1. 10万件のデータを準備\n2. CSV形式でエクスポート実行\n3. 処理時間を測定（目標: 30秒以内）',
            },
          },
          {
            title: 'PDF: 大量データ（10万件）エクスポート時間測定',
            customFields: {
              '1': 'バッチ',
              '2': '機能系',
              '3': '運用',
              '4': '1. 10万件のデータを準備\n2. PDF形式でエクスポート実行\n3. 処理時間を測定（目標: 60秒以内）',
            },
          },
        ],
      };
    }

    if (inputLower.includes('正常') || inputLower.includes('normal') || inputLower.includes('happy')) {
      return {
        message: '2件の正常系テストケースを追加しました',
        cases: [
          {
            title: 'CSV: 正常なデータエクスポート（期間指定あり）',
            customFields: {
              '1': 'オンライン',
              '2': '画面系',
              '3': 'テキスト',
              '4': '1. エクスポート画面を開く\n2. 期間を指定（例: 2026/01/01 - 2026/05/31）\n3. CSV形式を選択\n4. エクスポート実行\n5. ファイルがダウンロードされることを確認',
            },
          },
          {
            title: 'PDF: 正常なデータエクスポート（期間指定あり）',
            customFields: {
              '1': 'オンライン',
              '2': '画面系',
              '3': '書式',
              '4': '1. エクスポート画面を開く\n2. 期間を指定（例: 2026/01/01 - 2026/05/31）\n3. PDF形式を選択\n4. エクスポート実行\n5. ファイルがダウンロードされることを確認',
            },
          },
        ],
      };
    }

    if (inputLower.includes('異常') || inputLower.includes('エラー') || inputLower.includes('error')) {
      return {
        message: '3件の異常系テストケースを追加しました',
        cases: [
          {
            title: '不正な日付形式でのエクスポート試行',
            customFields: {
              '1': 'API',
              '2': '機能系',
              '3': 'テキスト',
              '4': '1. 日付パラメータに不正な値を設定（例: "abc"）\n2. エクスポート実行\n3. エラーメッセージが表示されることを確認',
            },
          },
          {
            title: '存在しないユーザーIDでのエクスポート試行',
            customFields: {
              '1': 'API',
              '2': '機能系',
              '3': 'マスキング',
              '4': '1. 存在しないユーザーIDを指定\n2. エクスポート実行\n3. 404エラーが返却されることを確認',
            },
          },
          {
            title: 'セッションタイムアウト後のエクスポート試行',
            customFields: {
              '1': 'オンライン',
              '2': '機能系',
              '3': 'ログ',
              '4': '1. ログイン後、セッションタイムアウトを待つ\n2. エクスポート実行\n3. ログイン画面にリダイレクトされることを確認',
            },
          },
        ],
      };
    }

    return {
      message: 'テストケースの提案: 「セキュリティ」「境界値」「パフォーマンス」「正常系」「異常系」などのキーワードで質問してください',
      cases: [],
    };
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
            { label: `Issue #${issueNumber}`, path: `/repositories/${repoId}/projects/${projectId}/issues/${issueId}` },
            { label: 'Test Cases' },
          ]}
        />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1>Test Cases</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Excel風エディタでテストケースを管理
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              <Upload className="size-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
              <Download className="size-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <Save className="size-4" />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {/* AI Dialog Area */}
        <div className="mb-6 bg-gradient-to-r from-primary/5 to-chart-4/5 border border-border rounded-lg p-4 flex-shrink-0">
          {/* Issue Context */}
          <div className="mb-3 flex items-start gap-3">
            <FileText className="size-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">
                Issue #{issue.number}: {issue.title}
              </h3>
              <p className="text-xs text-muted-foreground">{issue.description}</p>
            </div>
          </div>

          {/* AI Input */}
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-primary mt-2.5" />
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAiThinking) {
                      handleAiSubmit();
                    }
                  }}
                  placeholder="例: セキュリティのテストケースを追加して、境界値テストは何が必要？"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  disabled={isAiThinking}
                />
                <button
                  onClick={handleAiSubmit}
                  disabled={!aiInput.trim() || isAiThinking}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAiThinking ? (
                    <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>

              {/* AI Response */}
              {lastAiResponse && (
                <div className="mt-3 bg-background/80 border border-border rounded-md p-3">
                  <p className="text-sm">{lastAiResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Excel-like Table */}
        <div className="flex-1 overflow-auto bg-card border border-border rounded-lg">
          <table className="border-collapse" style={{ minWidth: 'max-content' }}>
            <thead className="bg-muted sticky top-0">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-medium border-r border-border relative"
                  style={{ width: columnWidths.id || 60 }}
                >
                  #
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                    onMouseDown={(e) => handleResizeStart('id', e.clientX)}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium border-r border-border relative"
                  style={{ width: columnWidths.title || 400 }}
                >
                  Title
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                    onMouseDown={(e) => handleResizeStart('title', e.clientX)}
                  />
                </th>
                {customFieldDefinitions.map((field) => (
                  <th
                    key={field.id}
                    className="px-4 py-3 text-left text-sm font-medium border-r border-border relative"
                    style={{ width: columnWidths[`custom_${field.id}`] || 150 }}
                  >
                    {field.name}
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                      onMouseDown={(e) => handleResizeStart(`custom_${field.id}`, e.clientX)}
                    />
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-left text-sm font-medium border-r border-border relative"
                  style={{ width: columnWidths.status || 120 }}
                >
                  Status
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                    onMouseDown={(e) => handleResizeStart('status', e.clientX)}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium border-r border-border relative"
                  style={{ width: columnWidths.assignee || 120 }}
                >
                  Assignee
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                    onMouseDown={(e) => handleResizeStart('assignee', e.clientX)}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium relative"
                  style={{ width: columnWidths.actions || 200 }}
                >
                  Actions
                  <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary"
                    onMouseDown={(e) => handleResizeStart('actions', e.clientX)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase, rowIndex) => (
                <tr key={testCase.id} className="border-t border-border hover:bg-accent/50">
                  <td
                    className="px-4 py-2 text-sm border-r border-border text-muted-foreground"
                    style={{ width: columnWidths.id || 60 }}
                  >
                    {testCase.id}
                  </td>
                  <td
                    className="px-4 py-2 text-sm border-r border-border cursor-text hover:bg-accent/50"
                    style={{ width: columnWidths.title || 400 }}
                    onClick={() => setEditingCell({ row: rowIndex, col: 'title' })}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === 'title' ? (
                      <input
                        type="text"
                        value={testCase.title}
                        onChange={(e) => handleCellEdit(rowIndex, 'title', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-ring rounded px-1"
                      />
                    ) : (
                      testCase.title || <span className="text-muted-foreground italic">Click to edit</span>
                    )}
                  </td>
                  {customFieldDefinitions.map((field) => {
                    const fieldValue = testCase.customFields?.[field.id] || '';
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === `custom_${field.id}`;

                    return (
                      <td
                        key={field.id}
                        className="px-4 py-2 text-sm border-r border-border cursor-pointer hover:bg-accent/50"
                        style={{ width: columnWidths[`custom_${field.id}`] || 150 }}
                        onClick={() => setEditingCell({ row: rowIndex, col: `custom_${field.id}` })}
                      >
                        {isEditing ? (
                          field.type === 'dropdown' ? (
                            <select
                              value={fieldValue}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[rowIndex] = {
                                  ...updated[rowIndex],
                                  customFields: {
                                    ...updated[rowIndex].customFields,
                                    [field.id]: e.target.value,
                                  },
                                };
                                setTestCases(updated);
                              }}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                            >
                              <option value="">-</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              value={fieldValue}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[rowIndex] = {
                                  ...updated[rowIndex],
                                  customFields: {
                                    ...updated[rowIndex].customFields,
                                    [field.id]: e.target.value,
                                  },
                                };
                                setTestCases(updated);
                              }}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="w-full bg-background border border-border rounded px-2 py-1 text-sm resize-none"
                              rows={3}
                            />
                          ) : (
                            <input
                              type="text"
                              value={fieldValue}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[rowIndex] = {
                                  ...updated[rowIndex],
                                  customFields: {
                                    ...updated[rowIndex].customFields,
                                    [field.id]: e.target.value,
                                  },
                                };
                                setTestCases(updated);
                              }}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-ring rounded px-1"
                            />
                          )
                        ) : (
                          <span className={`text-sm ${field.type === 'textarea' ? 'line-clamp-2 text-xs' : ''}`}>
                            {fieldValue || <span className="text-muted-foreground italic">-</span>}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td
                    className="px-4 py-2 text-sm border-r border-border cursor-pointer"
                    style={{ width: columnWidths.status || 120 }}
                    onClick={() => setEditingCell({ row: rowIndex, col: 'status' })}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === 'status' ? (
                      <select
                        value={testCase.status}
                        onChange={(e) => handleCellEdit(rowIndex, 'status', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full bg-background border border-border rounded px-2 py-1"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(testCase.status)}`}>
                        {testCase.status}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-2 text-sm border-r border-border cursor-text hover:bg-accent/50"
                    style={{ width: columnWidths.assignee || 120 }}
                    onClick={() => setEditingCell({ row: rowIndex, col: 'assignee' })}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === 'assignee' ? (
                      <input
                        type="text"
                        value={testCase.assignee}
                        onChange={(e) => handleCellEdit(rowIndex, 'assignee', e.target.value)}
                        onBlur={() => setEditingCell(null)}
                        autoFocus
                        className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-ring rounded px-1"
                      />
                    ) : (
                      testCase.assignee || <span className="text-muted-foreground italic">-</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-2 text-sm"
                    style={{ width: columnWidths.actions || 200 }}
                  >
                    <div className="flex items-center gap-2">
                      {testCase.bugId ? (
                        <button
                          onClick={() => {
                            const bug = reportedBugs.find(b => b.id === testCase.bugId);
                            if (bug) {
                              setSelectedBug(bug);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-chart-4/10 text-chart-4 border border-chart-4/20 rounded hover:bg-chart-4/20 transition-colors"
                        >
                          <AlertTriangle className="size-3" />
                          Bug #{testCase.bugId}
                        </button>
                      ) : testCase.status === 'Failed' ? (
                        <button
                          onClick={() => {
                            setSelectedTestCase(testCase);
                            setShowBugReport(true);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded hover:bg-destructive/20 transition-colors"
                        >
                          <AlertTriangle className="size-3" />
                          Report Bug
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 px-4 py-2 mt-4 border border-dashed border-border rounded-md hover:bg-accent transition-colors flex-shrink-0"
        >
          <Plus className="size-4" />
          Add Test Case
        </button>
      </div>

      {/* Bug Report Modal */}
      {showBugReport && selectedTestCase && (
        <BugReportModal
          onClose={() => {
            setShowBugReport(false);
            setSelectedTestCase(null);
          }}
          onSubmit={(bugData) => {
            // Generate mock bug ID
            const newBugId = Math.floor(Math.random() * 1000) + 100;

            // Create complete bug object
            const newBug: Bug = {
              ...bugData,
              id: newBugId,
              createdAt: new Date().toISOString().split('T')[0],
            };

            // Save bug to reported bugs
            setReportedBugs([...reportedBugs, newBug]);

            // Update test case with bug ID
            const updated = testCases.map(tc =>
              tc.id === selectedTestCase.id
                ? { ...tc, bugId: newBugId }
                : tc
            );
            setTestCases(updated);

            setShowBugReport(false);
            setSelectedTestCase(null);
          }}
          testCaseId={selectedTestCase.id}
          testCaseTitle={selectedTestCase.title}
          issueId={Number(issueId)}
          issueNumber={issueNumber}
          issueTitle="取引履歴エクスポート機能の追加"
          initialTitle={`[Failed Test] ${selectedTestCase.title}`}
        />
      )}

      {/* Bug Detail Modal */}
      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
        />
      )}
    </div>
  );
}
