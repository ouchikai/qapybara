import { useState } from 'react';
import { useParams } from 'react-router';
import { Save, FileText, MessageSquare, Sparkles, Send } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function TestCaseEditPage() {
  const { repoId, projectId, issueId, caseId } = useParams();

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock
  const issueNumber = 124; // Mock

  // Mock issue data
  const issue = {
    id: Number(issueId),
    number: issueNumber,
    title: '取引履歴エクスポート機能の追加',
    description: `## 概要
ユーザーが自分の取引履歴をCSVまたはPDFでエクスポートできる機能を追加します。

## 要件
- CSVとPDF両方のフォーマットに対応
- 期間指定でのフィルタリング可能
- 最大10万件までのデータに対応
- 他ユーザーのデータはアクセス不可（権限チェック）
- セッションタイムアウト時は適切にエラーハンドリング

## セキュリティ考慮事項
- 認証されたユーザーのみアクセス可能
- 他ユーザーのデータへの不正アクセス防止
- SQLインジェクション対策`,
  };

  // Mock test case data
  const [testCase, setTestCase] = useState({
    id: Number(caseId),
    title: '権限チェック: 他ユーザーのデータエクスポート試行',
    steps: [
      'ユーザーAでログイン',
      'ユーザーBの取引IDを指定してエクスポート実行',
      '403 Forbiddenが返却されることを確認',
    ],
    expected: 'エラーが発生せず、403レスポンスが返却されること',
  });

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'このテストケースについて、どのような点を改善したいですか？例えば、カバレッジの拡大、境界値のテスト、異常系のシナリオ追加などをお手伝いできます。',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: chatMessages.length + 1,
      role: 'user',
      content: inputMessage,
    };

    setChatMessages([...chatMessages, userMessage]);
    setInputMessage('');
    setIsAiThinking(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: aiResponse,
        },
      ]);
      setIsAiThinking(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('十分') || input.includes('足りない') || input.includes('他')) {
      return `現在のテストケースに加えて、以下のケースも追加することをお勧めします：

**1. 正常系のテスト**
- 自分のデータを正常にエクスポートできることの確認

**2. 境界値テスト**
- 0件のデータをエクスポート
- 上限の10万件をエクスポート
- 10万件を超える場合のエラーハンドリング

**3. パフォーマンステスト**
- 大量データ（10万件）のエクスポート時間測定
- タイムアウトしないことの確認

**4. セキュリティテスト**
- 未認証ユーザーからのアクセス拒否
- SQLインジェクション対策の確認

これらを追加しますか？`;
    }

    if (input.includes('境界値') || input.includes('エッジケース')) {
      return `境界値テストの提案：

**データ件数の境界値**
- 0件（データなし）
- 1件（最小）
- 99,999件（上限直前）
- 100,000件（上限ちょうど）
- 100,001件（上限超過）

**期間指定の境界値**
- 開始日 = 終了日（1日のみ）
- 1年間
- 10年間（長期間）

**ファイルサイズの境界値**
- 最小サイズ（ヘッダーのみ）
- 想定最大サイズ（10万件CSV）

これらをテストケースに追加しましょうか？`;
    }

    if (input.includes('手順') || input.includes('step')) {
      return `現在のテストケースの手順をより詳細にすることをお勧めします：

**改善案：**
1. テスト環境にユーザーA（test-user-a@example.com）でログイン
2. ダッシュボードから「取引履歴エクスポート」メニューを選択
3. エクスポート設定画面で、フォーマットに「CSV」を選択
4. ユーザーIDフィールドに、ユーザーB（user-id: 99999）のIDを直接入力
5. 「エクスポート実行」ボタンをクリック
6. HTTPレスポンスステータスが403であることを確認
7. エラーメッセージ「権限がありません」が表示されることを確認
8. エクスポートファイルが生成されていないことを確認

より具体的にしましょうか？`;
    }

    return `テストケースの改善についてお手伝いします。以下のような観点でアドバイスできます：

- **カバレッジの拡大**: 正常系、異常系、境界値のテストケース追加
- **詳細化**: 手順や期待結果をより具体的に
- **優先順位付け**: リスクベースでテストケースの優先度を決定

どの観点で改善したいですか？`;
  };

  const handleUpdateSteps = (index: number, value: string) => {
    const newSteps = [...testCase.steps];
    newSteps[index] = value;
    setTestCase({ ...testCase, steps: newSteps });
  };

  const handleAddStep = () => {
    setTestCase({
      ...testCase,
      steps: [...testCase.steps, ''],
    });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = testCase.steps.filter((_, i) => i !== index);
    setTestCase({ ...testCase, steps: newSteps });
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
            { label: 'Test Cases', path: `/repositories/${repoId}/projects/${projectId}/issues/${issueId}/test-cases` },
            { label: `Edit TC-${caseId}` },
          ]}
        />
        <div className="flex items-center justify-between mt-3">
          <h1>テストケース編集</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Save className="size-4" />
            Save Changes
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Side: Issue & Test Case */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Issue Information */}
          <section className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="size-5 text-primary" />
              <h2>Issue #{issue.number}: {issue.title}</h2>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <div className="whitespace-pre-wrap text-sm">{issue.description}</div>
            </div>
          </section>

          {/* Test Case Details */}
          <section className="bg-card border border-border rounded-lg p-4">
            <h2 className="mb-4">テストケース詳細</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <input
                type="text"
                value={testCase.title}
                onChange={(e) => setTestCase({ ...testCase, title: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Test Steps */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">テスト手順</label>
              <div className="space-y-2">
                {testCase.steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold mt-2">
                      {index + 1}
                    </span>
                    <textarea
                      value={step}
                      onChange={(e) => handleUpdateSteps(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="px-2 py-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddStep}
                className="mt-2 text-sm text-primary hover:underline"
              >
                + ステップを追加
              </button>
            </div>

            {/* Expected Result */}
            <div>
              <label className="block text-sm font-medium mb-2">期待結果</label>
              <textarea
                value={testCase.expected}
                onChange={(e) => setTestCase({ ...testCase, expected: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={3}
              />
            </div>
          </section>
        </div>

        {/* Right Side: AI Chat */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h3 className="font-semibold">AI アシスタント</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              テストケースの改善をサポートします
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex gap-3 justify-start">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="size-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="テストケースについて質問..."
                className="flex-1 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                disabled={isAiThinking}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isAiThinking}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
