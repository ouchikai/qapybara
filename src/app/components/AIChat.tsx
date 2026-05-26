import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatProps {
  projectName: string;
}

export function AIChat({ projectName }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: `こんにちは！${projectName}プロジェクトのQAアシスタントです。プロジェクトの状況について何でもお聞きください。`,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI responses based on common questions
  const generateResponse = (userQuestion: string): string => {
    const lowerQuestion = userQuestion.toLowerCase();

    if (lowerQuestion.includes('バグ') && (lowerQuestion.includes('多い') || lowerQuestion.includes('件数'))) {
      return '現在、総バグ数は71件で、週平均8.9件のペースで報告されています。特にFunctionalカテゴリが28件（全体の39%）と最も多く、次いでHighが25件となっています。解決率は100%を維持しており、優れた対応速度を示しています。';
    }

    if (lowerQuestion.includes('クリティカル') || lowerQuestion.includes('重要')) {
      return 'クリティカルなバグは19件（全体の26.8%）報告されています。主な内容は権限チェックとセッション管理に関するもので、セキュリティ関連のバグが全体の21%を占めています。これらは優先的に対応が必要です。';
    }

    if (lowerQuestion.includes('セキュリティ') || lowerQuestion.includes('security')) {
      return 'セキュリティ関連のバグが15件報告されており、全体の21%を占めています。特に権限チェックとセッション管理に関する問題が多発しています。CSVエクスポート機能での権限チェック不足や、セッションタイムアウト後の不正なリダイレクトなどが確認されています。';
    }

    if (lowerQuestion.includes('パフォーマンス') || lowerQuestion.includes('performance')) {
      return 'パフォーマンス関連のバグは12件報告されています。CSV/PDFエクスポート機能でのタイムアウトが複数報告されており、特に大量データ（10万件以上）の処理で問題が発生しています。メモリ使用量の最適化と非同期処理の改善が推奨されます。';
    }

    if (lowerQuestion.includes('進捗') || lowerQuestion.includes('状況') || lowerQuestion.includes('進み')) {
      return 'プロジェクト全体の進捗は良好です。8件のIssueのうち、2件がOpen、4件がIn Progress、2件がResolvedです。テストケースは45件あり、パス率は92%を記録しています。週次の解決率が100%を維持しており、計画通りに進行しています。';
    }

    if (lowerQuestion.includes('テスト') && (lowerQuestion.includes('失敗') || lowerQuestion.includes('failed'))) {
      return '現在、テストケースの8%が失敗しています（45件中約4件）。主な失敗要因は、CSV大量データエクスポートのタイムアウトとPDF日本語文字化けです。これらのテストケースからバグが報告されており、修正対応中です。';
    }

    if (lowerQuestion.includes('改善') || lowerQuestion.includes('提案') || lowerQuestion.includes('recommend')) {
      return `以下の3点を推奨します：\n\n1. セキュリティ関連のバグが多発しているため、権限チェックのコードレビューを強化\n2. CSV/PDFエクスポート機能のパフォーマンス最適化（非同期処理、ストリーミング、メモリ管理）\n3. 自動テストカバレッジを拡大し、リグレッションを早期検出`;
    }

    if (lowerQuestion.includes('リスク') || lowerQuestion.includes('懸念') || lowerQuestion.includes('risk')) {
      return '主なリスクは以下の3点です：\n\n1. セキュリティバグの多発（全体の21%）- 権限管理の見直しが急務\n2. パフォーマンス問題の継続 - 大量データ処理の最適化が必要\n3. クリティカル率26.8%と高水準 - 優先順位付けとリソース配分の再検討が推奨されます';
    }

    if (lowerQuestion.includes('未解決') || lowerQuestion.includes('open') || lowerQuestion.includes('残り')) {
      return '現在、新規（New）ステータスのバグはありません。In Progressが少数あり、すべて対応中です。過去7週間の解決率が100%を維持しているため、バックログは健全な状態です。';
    }

    if (lowerQuestion.includes('トレンド') || lowerQuestion.includes('推移') || lowerQuestion.includes('傾向')) {
      return '過去7週間のトレンドを分析すると、週平均8.9件のバグが報告され、すべて週内に解決されています。Week 2で15件とピークがありましたが、その後は6〜11件で安定しています。解決スピードが非常に速く、優れたQAプロセスを示しています。';
    }

    // Default response
    return `申し訳ありませんが、その質問には具体的な回答を持っていません。以下のような質問をお試しください：\n\n• バグの件数や傾向について\n• クリティカルなバグの状況\n• セキュリティやパフォーマンスの問題\n• プロジェクトの進捗状況\n• 改善提案やリスク分析`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: generateResponse(input),
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const suggestedQuestions = [
    'バグの件数と傾向を教えて',
    'クリティカルなバグはどれくらい？',
    'セキュリティ関連の問題は？',
    'プロジェクトの進捗状況は？',
    '改善提案をください',
  ];

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-primary/5">
        <Sparkles className="size-5 text-primary" />
        <h3 className="font-medium">AI QA Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-chart-4/20 text-chart-4'
              }`}
            >
              {message.role === 'user' ? (
                <span className="text-sm font-semibold">You</span>
              ) : (
                <Sparkles className="size-4" />
              )}
            </div>

            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-1">
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-chart-4/20 text-chart-4">
              <Sparkles className="size-4" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-2">質問例：</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-xs px-3 py-1 bg-muted hover:bg-accent rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="プロジェクトについて質問..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
