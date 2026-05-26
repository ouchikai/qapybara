import { useState } from 'react';
import { useParams } from 'react-router';
import { Play, CheckCircle2, XCircle, Clock, Upload, Calendar, Plus, AlertTriangle } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { BugReportModal } from './BugReportModal';

interface ExecutionResult {
  id: number;
  status: 'passed' | 'failed' | 'running';
  executedBy: string;
  executedAt: string;
  duration: string;
  notes?: string;
  attachments?: string[];
}

export function TestCaseDetailPage() {
  const { repoId, projectId, issueId, caseId } = useParams();
  const [showBugReport, setShowBugReport] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionResult | null>(null);

  const repoName = 'finance-portal'; // Mock
  const projectName = 'v2.5 Release'; // Mock
  const issueNumber = 124; // Mock

  const [executions] = useState<ExecutionResult[]>([
    {
      id: 1,
      status: 'passed',
      executedBy: '田中太郎',
      executedAt: '2026-05-22 10:30',
      duration: '2m 15s',
      notes: '問題なし',
    },
    {
      id: 2,
      status: 'failed',
      executedBy: '鈴木一郎',
      executedAt: '2026-05-22 09:15',
      duration: '15m 30s',
      notes: 'タイムアウト発生。パフォーマンス改善が必要',
      attachments: ['error-log.txt', 'screenshot.png'],
    },
    {
      id: 3,
      status: 'passed',
      executedBy: '田中太郎',
      executedAt: '2026-05-21 14:20',
      duration: '1m 50s',
    },
  ]);

  const testCase = {
    id: Number(caseId),
    title: '権限チェック: 他ユーザーのデータエクスポート試行',
    risk: 'S',
    category: 'Security',
    status: 'Passed',
    steps: [
      'ユーザーAでログイン',
      'ユーザーBの取引IDを指定してエクスポート実行',
      '403 Forbiddenが返却されることを確認',
    ],
    expected: 'エラーが発生せず、403レスポンスが返却されること',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="size-5 text-chart-2" />;
      case 'failed':
        return <XCircle className="size-5 text-destructive" />;
      case 'running':
        return <Clock className="size-5 text-chart-4 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      passed: 'bg-chart-2/10 text-chart-2',
      failed: 'bg-destructive/10 text-destructive',
      running: 'bg-chart-4/10 text-chart-4',
    };
    const labels = {
      passed: 'Passed',
      failed: 'Failed',
      running: 'Running',
    };
    return {
      style: styles[status as keyof typeof styles],
      label: labels[status as keyof typeof labels],
    };
  };

  const stats = {
    total: executions.length,
    passed: executions.filter((e) => e.status === 'passed').length,
    failed: executions.filter((e) => e.status === 'failed').length,
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
            { label: `TC-${caseId}` },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1>{testCase.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs border border-destructive/20 font-semibold">
                Risk: {testCase.risk}
              </span>
              <span className="px-2 py-1 bg-muted rounded text-xs">
                {testCase.category}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Play className="size-4" />
            Run Test
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-semibold">{stats.total}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Runs</div>
          </div>
          <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
            <div className="text-2xl font-semibold text-chart-2">{stats.passed}</div>
            <div className="text-sm text-chart-2 mt-1">Passed</div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="text-2xl font-semibold text-destructive">{stats.failed}</div>
            <div className="text-sm text-destructive mt-1">Failed</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Left: Test Steps */}
          <div className="space-y-6">
            <section className="bg-card border border-border rounded-lg p-4">
              <h2 className="mb-3">Test Steps</h2>
              <ol className="space-y-2">
                {testCase.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-card border border-border rounded-lg p-4">
              <h2 className="mb-3">Expected Result</h2>
              <p className="text-sm text-muted-foreground">{testCase.expected}</p>
            </section>
          </div>

          {/* Right: Execution History */}
          <div>
            <section className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2>Execution History</h2>
                <button className="flex items-center gap-2 px-3 py-1 text-sm border border-border rounded hover:bg-accent transition-colors">
                  <Plus className="size-3" />
                  Add Manual Result
                </button>
              </div>

              <div className="space-y-3">
                {executions.map((execution) => {
                  const statusBadge = getStatusBadge(execution.status);

                  return (
                    <div
                      key={execution.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="mt-0.5">{getStatusIcon(execution.status)}</div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${statusBadge.style}`}>
                              {statusBadge.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">By:</span>
                              <span>{execution.executedBy}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="size-3" />
                              <span>{execution.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            <span>{execution.executedAt}</span>
                          </div>

                          {execution.notes && (
                            <div className="bg-muted/50 rounded-md p-2 mt-3">
                              <p className="text-sm">{execution.notes}</p>
                            </div>
                          )}

                          {execution.attachments && execution.attachments.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              <Upload className="size-4 text-muted-foreground" />
                              <div className="flex flex-wrap gap-2">
                                {execution.attachments.map((file) => (
                                  <button
                                    key={file}
                                    className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded border border-border transition-colors"
                                  >
                                    {file}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {execution.status === 'failed' && (
                          <button
                            onClick={() => {
                              setSelectedExecution(execution);
                              setShowBugReport(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1 mt-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded hover:bg-destructive/20 transition-colors"
                          >
                            <AlertTriangle className="size-3" />
                            Report as Bug
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Bug Report Modal */}
      {showBugReport && (
        <BugReportModal
          onClose={() => {
            setShowBugReport(false);
            setSelectedExecution(null);
          }}
          onSubmit={() => {
            setShowBugReport(false);
            setSelectedExecution(null);
          }}
          testCaseId={testCase.id}
          testCaseTitle={testCase.title}
          issueId={Number(issueId)}
          issueNumber={issueNumber}
          issueTitle="取引履歴エクスポート機能の追加"
          initialTitle={`[Failed Test] ${testCase.title}`}
        />
      )}
    </div>
  );
}
